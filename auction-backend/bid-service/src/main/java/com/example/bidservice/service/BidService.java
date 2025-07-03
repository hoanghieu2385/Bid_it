package com.example.bidservice.service;

import com.example.bidservice.client.AuctionServiceClient;
import com.example.bidservice.client.UserServiceClient;
import com.example.bidservice.dto.BidResponse;
import com.example.bidservice.dto.WinnerUpdateDTO;
import com.example.bidservice.entity.Bid;
import com.example.bidservice.entity.BidStatus;
import com.example.bidservice.repository.BidRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

/**
 * BidService - xử lý toàn bộ nghiệp vụ đặt giá.
 * Gồm:
 * - Validate bid
 * - Cập nhật trạng thái các bid
 * - Lưu DB
 * - Gọi auction-service & user-service
 * - Gửi WebSocket notification
 */
@Service
@Transactional
public class BidService implements IBidService {
    private static final Logger logger = LoggerFactory.getLogger(WebSocketService.class);

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private UserServiceClient userServiceClient;

    @Autowired
    private AuctionServiceClient auctionServiceClient;

    @Autowired
    private IWebSocketService webSocketService;

    @Autowired
    private BidMessagePublisher bidMessagePublisher;

    // Tạo bid mới (dùng trong WebSocket)
    @Override
    public Bid createBid(Long auctionId, Long userId, BigDecimal bidAmount) {
        // 1. Validate bid
        validateBid(auctionId, userId, bidAmount);

        // 2. Cập nhật tất cả các bid cũ thành OUTBID và isWinning = false
        List<Bid> oldBids = bidRepository.findByAuctionId(auctionId);
        for (Bid oldBid : oldBids) {
            if (!oldBid.getUserId().equals(userId)) {
                try {
                    webSocketService.sendOutbidNotification(oldBid.getUserId(), auctionId, bidAmount);
                    bidMessagePublisher.publishOutbidNotification(auctionId, oldBid.getUserId(), bidAmount);
                } catch (Exception e) {
                    logger.warn("Failed to send outbid notification: {}", e.getMessage());
                }
            }
            oldBid.setStatus(BidStatus.OUTBID);
            oldBid.setIsWinning(false);
        }
        bidRepository.saveAll(oldBids);

        // Tạo bid mới với trạng thái ACTIVE và là người đang dẫn đầu
        Bid newBid = new Bid(auctionId, userId, bidAmount);
        newBid.setStatus(BidStatus.ACTIVE);
        newBid.setIsWinning(true);
        Bid savedBid = bidRepository.save(newBid);

        // Update auction-service
        try {
            long totalBids = bidRepository.countByAuctionId(auctionId);
            auctionServiceClient.updateCurrentBid(auctionId, bidAmount, (int) totalBids);
        } catch (Exception e) {
            logger.warn("Failed to update current bid in auction service: {}", e.getMessage());
        }

        // Publish BID CREATED để xử lý async (analytics, log, external)
        bidMessagePublisher.publishBidCreated(auctionId, userId, bidAmount, savedBid.getId());

        // Gửi realtime notification qua Rabbit
        BidResponse bidResponse = mapToBidResponse(savedBid);
        bidMessagePublisher.publishBidNotification(auctionId, bidResponse, "NEW_BID");

        // Gửi realtime WebSocket trực tiếp
        sendRealtimeBidUpdate(savedBid);

        return savedBid;
    }

    // Validate user không phải là người bid cao nhất hiện tại
    private void validateUserNotAlreadyHighestBidder(Long auctionId, Long userId) {
        logger.info("🔍 Checking if user {} is already highest bidder for auction {}", userId, auctionId);

        Optional<Bid> highestBid = bidRepository.findHighestBidByAuctionId(auctionId);

        if (highestBid.isPresent()) {
            Bid currentHighest = highestBid.get();
            logger.info("📊 Current highest bid: ID={}, User={}, Amount={}",
                    currentHighest.getId(), currentHighest.getUserId(), currentHighest.getBidAmount());

            if (currentHighest.getUserId().equals(userId)) {
                logger.error("❌ DUPLICATE HIGHEST BID: User {} already has the highest bid {} on auction {}",
                        userId, currentHighest.getBidAmount(), auctionId);
                throw new RuntimeException("You already have the highest bid. Please wait for others to bid higher before placing another bid.");
            }

            logger.info("✅ User {} is not the current highest bidder", userId);
        } else {
            logger.info("ℹ️ No previous bids found for auction {}", auctionId);
        }
    }
    // Validate các điều kiện trước khi bid

    @Override
    public void validateBid(Long auctionId, Long userId, BigDecimal bidAmount) {
        logger.info("🔍 ===== STARTING BID VALIDATION =====");
        logger.info("🏛️ Auction ID: {}", auctionId);
        logger.info("👤 User ID: {}", userId);
        logger.info("💰 Bid Amount: {}", bidAmount);

        // Null checks
        if (auctionId == null) {
            logger.error("❌ VALIDATION FAILED: Auction ID is null");
            throw new RuntimeException("Auction ID cannot be null");
        }
        if (userId == null) {
            logger.error("❌ VALIDATION FAILED: User ID is null");
            throw new RuntimeException("User ID cannot be null");
        }
        if (bidAmount == null) {
            logger.error("❌ VALIDATION FAILED: Bid amount is null");
            throw new RuntimeException("Bid amount cannot be null");
        }

        logger.info("✅ Basic null checks passed");

        try {
            // Validate auction
            logger.info("🔍 Validating auction...");
            AuctionServiceClient.AuctionResponse auction = auctionServiceClient.getAuctionById(auctionId);

            if (auction == null) {
                logger.error("❌ AUCTION NOT FOUND: Auction {} does not exist", auctionId);
                throw new RuntimeException("Auction not found");
            }

            logger.info("✅ Auction found: {}", auction.getTitle());
            logger.info("📊 Auction status: {}", auction.getStatus());
            logger.info("⏰ Start time: {}", auction.getStartTime());
            logger.info("⏰ End time: {}", auction.getEndTime());
            logger.info("💰 Starting price: {}", auction.getStartingPrice());
            logger.info("📈 Increment amount: {}", auction.getIncrementAmount());

            // Check auction status
            if (!"OPENED".equals(auction.getStatus())) {
                logger.error("❌ AUCTION STATUS INVALID: Status is '{}', required 'OPENED'", auction.getStatus());

                if ("UPCOMING".equals(auction.getStatus())) {
                    logger.error("📅 Auction {} has not started yet", auctionId);
                    throw new RuntimeException("Auction has not started yet");
                } else if ("ENDED".equals(auction.getStatus()) || "CLOSED".equals(auction.getStatus())) {
                    logger.error("🔚 Auction {} has ended", auctionId);
                    throw new RuntimeException("Auction has ended");
                } else if ("CANCELLED".equals(auction.getStatus())) {
                    logger.error("🚫 Auction {} has been cancelled", auctionId);
                    throw new RuntimeException("Auction has been cancelled");
                } else {
                    logger.error("❓ Auction {} has unknown status: {}", auctionId, auction.getStatus());
                    throw new RuntimeException("Auction is not available for bidding");
                }
            }

            logger.info("✅ Auction status is valid: {}", auction.getStatus());

            // Time validation
            LocalDateTime now = LocalDateTime.now();
            logger.info("⏰ Current time: {}", now);

            if (auction.getStartTime() != null && auction.getStartTime().isAfter(now)) {
                logger.error("❌ AUCTION NOT STARTED: Current time {} is before start time {}",
                        now, auction.getStartTime());
                throw new RuntimeException("Auction has not started yet. Start time: " + auction.getStartTime());
            }

            if (auction.getEndTime() != null && auction.getEndTime().isBefore(now)) {
                logger.error("❌ AUCTION ENDED: Current time {} is after end time {}",
                        now, auction.getEndTime());
                throw new RuntimeException("Auction has ended. End time: " + auction.getEndTime());
            }

            logger.info("✅ Auction time validation passed");

            // Current highest bid validation
            BigDecimal currentHighest = getCurrentHighestBid(auctionId);
            logger.info("💰 Current highest bid: {}", currentHighest);

            if (currentHighest != null && bidAmount.compareTo(currentHighest) <= 0) {
                logger.error("❌ BID TOO LOW: Bid amount {} is not higher than current highest {}",
                        bidAmount, currentHighest);
                throw new RuntimeException("Bid amount must be higher than current highest bid: " + currentHighest);
            }

            logger.info("✅ Bid amount is higher than current highest");

            // Increment validation
            BigDecimal incrementAmount = auction.getIncrementAmount();
            if (incrementAmount != null && incrementAmount.compareTo(BigDecimal.ZERO) > 0) {
                logger.info("📈 Validating increment amount: {}", incrementAmount);

                if (currentHighest != null) {
                    BigDecimal requiredMinimum = currentHighest.add(incrementAmount);
                    logger.info("💰 Required minimum bid: {} (current: {} + increment: {})",
                            requiredMinimum, currentHighest, incrementAmount);

                    if (bidAmount.compareTo(requiredMinimum) < 0) {
                        logger.error("❌ INSUFFICIENT INCREMENT: Bid {} is less than required minimum {}",
                                bidAmount, requiredMinimum);
                        throw new RuntimeException("Bid amount must be at least " + requiredMinimum +
                                " (current highest: " + currentHighest + " + minimum increment: " + incrementAmount + ")");
                    }
                }
            }

            logger.info("✅ Increment validation passed");

            // Check if user already has highest bid
            logger.info("🔍 Checking if user already has highest bid...");
            validateUserNotAlreadyHighestBidder(auctionId, userId);
            logger.info("✅ User is not the current highest bidder");

            // Starting price validation
            BigDecimal startingPrice = auction.getStartingPrice();
            if (startingPrice != null && bidAmount.compareTo(startingPrice) < 0) {
                logger.error("❌ BELOW STARTING PRICE: Bid {} is below starting price {}",
                        bidAmount, startingPrice);
                throw new RuntimeException("Bid amount must be at least: " + startingPrice);
            }

            logger.info("✅ Starting price validation passed");

            // Self-bid validation
            if (userId.equals(auction.getSellerId())) {
                logger.error("❌ SELF BID ATTEMPT: User {} tried to bid on own auction {}",
                        userId, auctionId);
                throw new RuntimeException("You cannot bid on your own auction");
            }

            logger.info("✅ Self-bid validation passed");

        } catch (Exception e) {
            if (e instanceof RuntimeException) {
                throw e;
            }
            logger.error("❌ AUCTION VALIDATION ERROR: {}", e.getMessage());
            throw new RuntimeException("Failed to validate auction: " + e.getMessage());
        }

        // User validation
        try {
            logger.info("🔍 Validating user...");
            UserServiceClient.UserResponse user = userServiceClient.getUserById(userId);

            if (user == null) {
                logger.error("❌ USER NOT FOUND: User {} does not exist", userId);
                throw new RuntimeException("User not found");
            }

            logger.info("✅ User found: {} ({})", user.getFullName(), user.getUsername());

            // Points validation
            logger.info("🔍 Checking user points...");
            Integer score = userServiceClient.getUserScore(userId);

            if (score == null) {
                logger.error("❌ POINTS CHECK FAILED: Cannot retrieve points for user {}", userId);
                throw new RuntimeException("Can't get user points. Please try again later.");
            }

            logger.info("🎯 User points: {}", score);

            if (score < 50) {
                logger.error("❌ INSUFFICIENT POINTS: User {} has {} points, needs at least 50",
                        userId, score);
                throw new IllegalArgumentException("You need at least 50 points to place a bid.");
            }

            logger.info("✅ User has sufficient points: {}", score);

        } catch (Exception e) {
            if (e instanceof RuntimeException) {
                throw e;
            }
            logger.error("❌ USER VALIDATION ERROR: {}", e.getMessage());
            throw new RuntimeException("Failed to validate user: " + e.getMessage());
        }

        logger.info("✅ ===== BID VALIDATION COMPLETED SUCCESSFULLY =====");
    }

    // Helper method để cập nhật tất cả bid khác thành OUTBID
    private void updateAllOtherBidsToOutbid(Long auctionId, Long winningBidId) {
        List<Bid> otherBids = bidRepository.findByAuctionIdAndIdNot(auctionId, winningBidId);

        for (Bid bid : otherBids) {
            if (bid.getStatus() == BidStatus.ACTIVE) { // Chỉ update những bid ACTIVE
                bid.setStatus(BidStatus.OUTBID);
                bid.setIsWinning(false);
            }
        }

        if (!otherBids.isEmpty()) {
            bidRepository.saveAll(otherBids);
        }
    }

    // Xử lý khi phiên đấu giá kết thúc
    @Override
    @Transactional
    public void processAuctionEnd(Long auctionId) {
        try {
            // Kiểm tra auction đã thực sự kết thúc chưa
            AuctionServiceClient.AuctionResponse auction = auctionServiceClient.getAuctionById(auctionId);
            if (auction == null) throw new RuntimeException("Auction not found: " + auctionId);

            boolean endedByTime = auction.getEndTime() != null && auction.getEndTime().isBefore(LocalDateTime.now());
            boolean endedByStatus = "CLOSED".equals(auction.getStatus()) || "ENDED".equals(auction.getStatus());

            if (!endedByTime && !endedByStatus) {
                logger.info("Auction {} not ended yet. Skipping.", auctionId);
                return;
            }

            Optional<Bid> highestBidOpt = bidRepository.findHighestBidByAuctionId(auctionId);
            if (highestBidOpt.isPresent()) {
                Bid winningBid = highestBidOpt.get();

                winningBid.setStatus(BidStatus.WINNING);
                winningBid.setIsWinning(true);
                bidRepository.save(winningBid);
                updateAllOtherBidsToOutbid(auctionId, winningBid.getId());

                try {
                    auctionServiceClient.updateWinner(auctionId, new WinnerUpdateDTO(winningBid.getUserId()));
                    logger.info("Updated winner for auction {}", auctionId);
                } catch (Exception e) {
                    logger.warn("Failed to update winner in auction-service: {}", e.getMessage());
                }

                sendWinnerNotification(winningBid);
            } else {
                logger.info("No bids found for auction {}", auctionId);
            }
        } catch (Exception e) {
            logger.error("Error while processing auction end: {}", e.getMessage());
            throw new RuntimeException(e);
        }
    }

    // Method gửi notification về winner
    private void sendWinnerNotification(Bid winningBid) {
        try {
            BidResponse bidResponse = mapToBidResponse(winningBid);

            webSocketService.sendAuctionEndNotification(bidResponse);

            IBidService.BidStatistics finalStats = getBidStatistics(winningBid.getAuctionId());
            webSocketService.sendBidStatistics(winningBid.getAuctionId(), finalStats);

        } catch (Exception e) {
            System.err.println("Failed to send winner notification: " + e.getMessage());
        }
    }

    // Lấy giá cao nhất hiện tại (không phân biệt trạng thái)
    @Override
    public BigDecimal getCurrentHighestBid(Long auctionId) {
        if (auctionId == null) {
            return null;
        }
        // Lấy bid cao nhất dựa trên amount, không phụ thuộc vào status WINNING
        return bidRepository.findMaxBidAmountByAuctionId(auctionId).orElse(null);
    }

    private BidResponse mapToBidResponse(Bid bid) {
        String firstName = "";
        String lastName = "";

        try {
            UserServiceClient.UserResponse user = userServiceClient.getUserById(bid.getUserId());
            if (user != null) {
                firstName = user.getFirstName() != null ? user.getFirstName() : "";
                lastName = user.getLastName() != null ? user.getLastName() : "";
                if (firstName.isEmpty() && lastName.isEmpty() && user.getFullName() != null) {
                    String[] nameParts = user.getFullName().trim().split(" ", 2);
                    firstName = nameParts.length > 0 ? nameParts[0] : "";
                    lastName = nameParts.length > 1 ? nameParts[1] : "";
                }
            }
        } catch (Exception e) {
            System.err.println("Failed to enrich bid with user info: " + e.getMessage());
        }

        return new BidResponse(
                bid.getId(),
                bid.getAuctionId(),
                bid.getUserId(),
                firstName,
                lastName,
                bid.getBidAmount(),
                bid.getBidTime(),
                bid.getIsWinning(),
                bid.getStatus().name()
        );
    }


    // Enrich dữ liệu bid bằng thông tin user & auction
    @Override
    public Bid enrichBidWithExternalData(Bid bid) {
        if (bid == null) {
            return null;
        }

        try {
            // Lấy thông tin user
            UserServiceClient.UserResponse user = userServiceClient.getUserById(bid.getUserId());
            if (user != null) {
                bid.setUsername(user.getUsername());
            }
        } catch (Exception e) {
            System.err.println("Failed to get user info for userId " + bid.getUserId() + ": " + e.getMessage());
        }

        try {
            // Lấy thông tin auction
            AuctionServiceClient.AuctionResponse auction = auctionServiceClient.getAuctionById(bid.getAuctionId());
            if (auction != null) {
                bid.setAuctionTitle(auction.getTitle());
            }
        } catch (Exception e) {
            System.err.println("Failed to get auction info for auctionId " + bid.getAuctionId() + ": " + e.getMessage());
        }

        // Set current highest bid
        bid.setCurrentHighestBid(getCurrentHighestBid(bid.getAuctionId()));

        return bid;
    }

    @Override
    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 100))
    public void sendRealtimeBidUpdate(Bid bid) {
        try {
            Bid enrichedBid = enrichBidWithExternalData(bid); // ✅ đảm bảo có userName
            BidResponse bidResponse = mapToBidResponse(enrichedBid); // ⚡ chắc chắn đầy đủ

            // 1. Gửi bid mới
            webSocketService.sendNewBidNotification(bidResponse);

            // 2. Gửi bid history update
            webSocketService.sendBidHistoryUpdate(bid.getAuctionId(), bidResponse);

            // 3. Gửi thống kê
            IBidService.BidStatistics stats = getBidStatistics(bid.getAuctionId());
            webSocketService.sendBidStatistics(bid.getAuctionId(), stats);

        } catch (Exception e) {
            System.err.println("Failed to send realtime update: " + e.getMessage());
            throw e;
        }
    }
    // Lấy các bid theo lịch sử
    @Override
    public List<Bid> getBidHistory(Long auctionId) {
        List<Bid> bids = bidRepository.findBidHistoryByAuctionId(auctionId);
        bids.forEach(this::enrichBidWithExternalData);
        return bids;
    }

    // Lấy các bid theo userId
    @Override
    public List<Bid> getBidsByUser(Long userId) {
        List<Bid> bids = bidRepository.findByUserIdOrderByCreatedAtDesc(userId);
        bids.forEach(this::enrichBidWithExternalData);
        return bids;
    }

    // Trả về thống kê bid
    @Override
    public IBidService.BidStatistics getBidStatistics(Long auctionId) {
        long totalBids = bidRepository.countByAuctionId(auctionId);
        BigDecimal highestBid = getCurrentHighestBid(auctionId);
        Optional<Bid> highestBidDetails = bidRepository.findHighestBidByAuctionId(auctionId);

        IBidService.BidStatistics stats = new IBidService.BidStatistics();
        stats.setAuctionId(auctionId);
        stats.setTotalBids(totalBids);
        stats.setHighestBid(highestBid);

        if (highestBidDetails.isPresent()) {
            Bid bid = highestBidDetails.get();
            try {
                UserServiceClient.UserResponse user = userServiceClient.getUserById(bid.getUserId());
                if (user != null) {
                    String firstName = user.getFirstName() != null ? user.getFirstName() : "";
                    String lastName = user.getLastName() != null ? user.getLastName() : "";
                    String fullName = (firstName + " " + lastName).trim();
                    stats.setHighestBidder(fullName.isEmpty() ? "Unknown" : fullName);
                }
            } catch (Exception e) {
                System.err.println("Failed to get user info: " + e.getMessage());
                stats.setHighestBidder("Unknown");
            }
            stats.setHighestBidTime(bid.getCreatedAt());
        }

        return stats;
    }

    public Optional<Bid> getLastBidByUserAndAuction(Long auctionId, Long userId) {
        if (auctionId == null || userId == null) {
            return Optional.empty();
        }
        List<Bid> userBids = bidRepository.findByAuctionIdAndUserIdOrderByCreatedAtDesc(auctionId, userId);
        return userBids.isEmpty() ? Optional.empty() : Optional.of(userBids.get(0));
    }
}