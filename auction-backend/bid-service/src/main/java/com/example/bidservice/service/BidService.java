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
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * BidService - xử lý toàn bộ nghiệp vụ đặt giá.
 * Tối ưu hóa với user caching để giảm số lần gọi API
 */
@Service
@Transactional
public class BidService implements IBidService {
    private static final Logger logger = LoggerFactory.getLogger(BidService.class);

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

    // Cache để tránh gọi getUserById nhiều lần
    private final Map<Long, UserServiceClient.UserResponse> userCache = new ConcurrentHashMap<>();
    private final Map<Long, Long> userCacheTimestamp = new ConcurrentHashMap<>();
    private static final long CACHE_DURATION = 5 * 60 * 1000; // 5 phút

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

    /**
     * Lấy thông tin user với cache để tránh gọi API nhiều lần
     */
    private UserServiceClient.UserResponse getCachedUserInfo(Long userId) {
        if (userId == null) return null;

        // Check cache
        Long timestamp = userCacheTimestamp.get(userId);
        if (timestamp != null && (System.currentTimeMillis() - timestamp) < CACHE_DURATION) {
            UserServiceClient.UserResponse cachedUser = userCache.get(userId);
            if (cachedUser != null) {
                logger.debug("👤 Using cached user info for userId: {}", userId);
                return cachedUser;
            }
        }

        // Fetch from API
        try {
            logger.debug("🔄 Fetching user info from API for userId: {}", userId);
            UserServiceClient.UserResponse user = userServiceClient.getUserById(userId);
            if (user != null) {
                userCache.put(userId, user);
                userCacheTimestamp.put(userId, System.currentTimeMillis());
            }
            return user;
        } catch (Exception e) {
            logger.warn("Failed to fetch user info for userId {}: {}", userId, e.getMessage());
            return null;
        }
    }

    /**
     * Batch load user info cho nhiều userIds cùng lúc
     */
    private Map<Long, UserServiceClient.UserResponse> batchLoadUserInfo(Set<Long> userIds) {
        Map<Long, UserServiceClient.UserResponse> result = new HashMap<>();

        // Lấy từ cache trước
        Set<Long> needToFetch = new HashSet<>();
        for (Long userId : userIds) {
            UserServiceClient.UserResponse cached = getCachedUserInfo(userId);
            if (cached != null) {
                result.put(userId, cached);
            } else {
                needToFetch.add(userId);
            }
        }

        // Fetch những user chưa có trong cache
        for (Long userId : needToFetch) {
            try {
                UserServiceClient.UserResponse user = userServiceClient.getUserById(userId);
                if (user != null) {
                    result.put(userId, user);
                    userCache.put(userId, user);
                    userCacheTimestamp.put(userId, System.currentTimeMillis());
                }
            } catch (Exception e) {
                logger.warn("Failed to fetch user info for userId {}: {}", userId, e.getMessage());
            }
        }

        return result;
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
    @Retryable(
            value = {Exception.class},
            maxAttempts = 3,
            backoff = @Backoff(delay = 200)
    )
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

            // Check auction status
            if (!"OPENED".equals(auction.getStatus())) {
                logger.error("❌ AUCTION STATUS INVALID: Status is '{}', required 'OPENED'", auction.getStatus());
                throw new RuntimeException("Auction is not available for bidding");
            }

            // Time validation
            LocalDateTime now = LocalDateTime.now();
            if (auction.getStartTime() != null && auction.getStartTime().isAfter(now)) {
                throw new RuntimeException("Auction has not started yet");
            }
            if (auction.getEndTime() != null && auction.getEndTime().isBefore(now)) {
                throw new RuntimeException("Auction has ended");
            }

            // Current highest bid validation
            BigDecimal currentHighest = getCurrentHighestBid(auctionId);
            if (currentHighest != null && bidAmount.compareTo(currentHighest) <= 0) {
                throw new RuntimeException("Bid amount must be higher than current highest bid: " + currentHighest);
            }

            // Increment validation
            BigDecimal incrementAmount = auction.getIncrementAmount();
            if (incrementAmount != null && incrementAmount.compareTo(BigDecimal.ZERO) > 0 && currentHighest != null) {
                BigDecimal requiredMinimum = currentHighest.add(incrementAmount);
                if (bidAmount.compareTo(requiredMinimum) < 0) {
                    throw new RuntimeException("Bid amount must be at least " + requiredMinimum);
                }
            }

            // Check if user already has highest bid
            validateUserNotAlreadyHighestBidder(auctionId, userId);

            // Starting price validation
            BigDecimal startingPrice = auction.getStartingPrice();
            if (startingPrice != null && bidAmount.compareTo(startingPrice) < 0) {
                throw new RuntimeException("Bid amount must be at least: " + startingPrice);
            }

            // Self-bid validation
            if (userId.equals(auction.getSellerId())) {
                throw new RuntimeException("You cannot bid on your own auction");
            }

        } catch (Exception e) {
            if (e instanceof RuntimeException) {
                throw e;
            }
            throw new RuntimeException("Failed to validate auction: " + e.getMessage());
        }

        // User validation - SỬ DỤNG CACHE
        try {
            logger.info("🔍 Validating user...");
            UserServiceClient.UserResponse user = getCachedUserInfo(userId);

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

            if (score < 50) {
                logger.error("❌ INSUFFICIENT POINTS: User {} has {} points, needs at least 50", userId, score);
                throw new IllegalArgumentException("You need at least 50 points to place a bid.");
            }

            logger.info("✅ User has sufficient points: {}", score);

        } catch (Exception e) {
            if (e instanceof RuntimeException) {
                throw e;
            }
            throw new RuntimeException("Failed to validate user: " + e.getMessage());
        }

        logger.info("✅ ===== BID VALIDATION COMPLETED SUCCESSFULLY =====");
    }

    // Helper method để cập nhật tất cả bid khác thành OUTBID
    private void updateAllOtherBidsToOutbid(Long auctionId, Long winningBidId) {
        List<Bid> otherBids = bidRepository.findByAuctionIdAndIdNot(auctionId, winningBidId);

        for (Bid bid : otherBids) {
            if (bid.getStatus() == BidStatus.ACTIVE) {
                bid.setStatus(BidStatus.OUTBID);
                bid.setIsWinning(false);
            }
        }

        if (!otherBids.isEmpty()) {
            bidRepository.saveAll(otherBids);
        }
    }

    // Lấy giá cao nhất hiện tại
    @Override
    public BigDecimal getCurrentHighestBid(Long auctionId) {
        if (auctionId == null) return null;
        return bidRepository.findMaxBidAmountByAuctionId(auctionId).orElse(null);
    }

    /**
     * Tối ưu hóa mapToBidResponse bằng cách sử dụng cached user info
     */
    private BidResponse mapToBidResponse(Bid bid) {
        String firstName = "";
        String lastName = "";

        try {
            UserServiceClient.UserResponse user = getCachedUserInfo(bid.getUserId());
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
            logger.warn("Failed to get user info for bid mapping: {}", e.getMessage());
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
        if (bid == null) return null;

        try {
            UserServiceClient.UserResponse user = getCachedUserInfo(bid.getUserId());
            if (user != null) {
                String fullName = user.getFullName();
                if (fullName == null || fullName.trim().isEmpty()) {
                    fullName = ((user.getFirstName() != null ? user.getFirstName() : "") + " " +
                            (user.getLastName() != null ? user.getLastName() : "")).trim();
                }
                bid.setUsername(fullName.isEmpty() ? "Unknown Bidder" : fullName);
            }
        } catch (Exception e) {
            logger.warn("Failed to get user info for bid enrichment: {}", e.getMessage());
        }

        try {
            AuctionServiceClient.AuctionResponse auction = auctionServiceClient.getAuctionById(bid.getAuctionId());
            if (auction != null) {
                bid.setAuctionTitle(auction.getTitle());
            }
        } catch (Exception e) {
            logger.warn("Failed to get auction info for bid enrichment: {}", e.getMessage());
        }

        bid.setCurrentHighestBid(getCurrentHighestBid(bid.getAuctionId()));
        return bid;
    }

    @Override
    @Retryable(maxAttempts = 3, backoff = @Backoff(delay = 100))
    public void sendRealtimeBidUpdate(Bid bid) {
        try {
            Bid enrichedBid = enrichBidWithExternalData(bid);
            BidResponse bidResponse = mapToBidResponse(enrichedBid);

            webSocketService.sendNewBidNotification(bidResponse);
            webSocketService.sendBidHistoryUpdate(bid.getAuctionId(), bidResponse);

            IBidService.BidStatistics stats = getBidStatistics(bid.getAuctionId());
            webSocketService.sendBidStatistics(bid.getAuctionId(), stats);

        } catch (Exception e) {
            logger.error("Failed to send realtime update: {}", e.getMessage());
            throw e;
        }
    }

    // Lấy bid history với batch loading user info
    @Override
    public List<Bid> getBidHistory(Long auctionId) {
        List<Bid> bids = bidRepository.findBidHistoryByAuctionId(auctionId);

        // Batch load user info cho tất cả bids
        Set<Long> userIds = bids.stream()
                .map(Bid::getUserId)
                .collect(Collectors.toSet());

        Map<Long, UserServiceClient.UserResponse> userInfoMap = batchLoadUserInfo(userIds);

        // Enrich bids với user info đã load
        for (Bid bid : bids) {
            UserServiceClient.UserResponse user = userInfoMap.get(bid.getUserId());
            if (user != null) {
                String fullName = user.getFullName();
                if (fullName == null || fullName.trim().isEmpty()) {
                    fullName = ((user.getFirstName() != null ? user.getFirstName() : "") + " " +
                            (user.getLastName() != null ? user.getLastName() : "")).trim();
                }
                bid.setUsername(fullName.isEmpty() ? "Unknown Bidder" : fullName);
            }
            bid.setCurrentHighestBid(getCurrentHighestBid(bid.getAuctionId()));
        }

        return bids;
    }

    // Lấy bids by user với cache
    @Override
    public List<Bid> getBidsByUser(Long userId) {
        List<Bid> bids = bidRepository.findByUserIdOrderByCreatedAtDesc(userId);
        bids.forEach(this::enrichBidWithExternalData);
        return bids;
    }

    // Trả về thống kê bid với cached user info
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
                UserServiceClient.UserResponse user = getCachedUserInfo(bid.getUserId());
                if (user != null) {
                    String firstName = user.getFirstName() != null ? user.getFirstName() : "";
                    String lastName = user.getLastName() != null ? user.getLastName() : "";
                    String fullName = (firstName + " " + lastName).trim();
                    stats.setHighestBidder(fullName.isEmpty() ? "Unknown" : fullName);
                }
            } catch (Exception e) {
                logger.warn("Failed to get user info for statistics: {}", e.getMessage());
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