package com.example.bidservice.service;

import com.example.bidservice.client.AuctionServiceClient;
import com.example.bidservice.client.UserServiceClient;
import com.example.bidservice.dto.BidResponse;
import com.example.bidservice.dto.WinnerUpdateDTO;
import com.example.bidservice.entity.Bid;
import com.example.bidservice.entity.BidStatus;
import com.example.bidservice.repository.BidRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class BidService implements IBidService {

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private UserServiceClient userServiceClient;

    @Autowired
    private AuctionServiceClient auctionServiceClient;

    @Autowired
    private IWebSocketService webSocketService;

    // KHÔNG cập nhật winner ngay lập tức
    @Override
    public Bid createBid(Long auctionId, Long userId, BigDecimal bidAmount) {
        // 1. Validate bid
        validateBid(auctionId, userId, bidAmount);

        // 2. Cập nhật tất cả các bid cũ thành OUTBID và isWinning = false
        List<Bid> oldBids = bidRepository.findByAuctionId(auctionId);

        for (Bid oldBid : oldBids) {
            if (!oldBid.getUserId().equals(userId)) {
                // Gửi notification đến user bị outbid
                try {
                    webSocketService.sendOutbidNotification(oldBid.getUserId(), auctionId, bidAmount);
                } catch (Exception e) {
                    System.err.println("Failed to send outbid notification: " + e.getMessage());
                }
            }

            // Cập nhật trạng thái bid cũ
            oldBid.setStatus(BidStatus.OUTBID);
            oldBid.setIsWinning(false);
        }

        bidRepository.saveAll(oldBids); // Lúc này đã có dữ liệu mới nên sẽ có hiệu lực

        // 3. Tạo bid mới với trạng thái ACTIVE và là người đang dẫn đầu
        Bid newBid = new Bid(auctionId, userId, bidAmount);
        newBid.setStatus(BidStatus.ACTIVE);
        newBid.setIsWinning(true); // Đặt là người thắng tạm thời

        Bid savedBid = bidRepository.save(newBid);

        // 4. Cập nhật currentBid và bidCount trong auction-service
        try {
            long totalBids = bidRepository.countByAuctionId(auctionId);

            auctionServiceClient.updateCurrentBid(auctionId, bidAmount, (int) totalBids);

            System.out.println("Updated auction " + auctionId + " with currentBid: " + bidAmount + ", bidCount: " + totalBids);

        } catch (Exception e) {
            System.err.println("Failed to update current bid in auction service: " + e.getMessage());
            // Không throw exception để không làm fail toàn bộ bid process
        }

        // 5. Enrich data và gửi notification
        enrichBidWithExternalData(savedBid);
        sendRealtimeBidUpdate(savedBid);

        return savedBid;
    }

    // method để xử lý khi auction kết thúc
    @Override
    @Transactional
    public void processAuctionEnd(Long auctionId) {
        try {
            // Kiểm tra auction đã thực sự kết thúc chưa
            AuctionServiceClient.AuctionResponse auction = auctionServiceClient.getAuctionById(auctionId);
            if (auction == null) {
                throw new RuntimeException("Auction not found: " + auctionId);
            }

            LocalDateTime now = LocalDateTime.now();

            // Kiểm tra auction đã kết thúc chưa (cả về thời gian và status)
            boolean isEndedByTime = auction.getEndTime() != null && auction.getEndTime().isBefore(now);
            boolean isEndedByStatus = "CLOSED".equals(auction.getStatus()) || "ENDED".equals(auction.getStatus());

            if (!isEndedByTime && !isEndedByStatus) {
                System.out.println("Auction " + auctionId + " has not ended yet. Status: " +
                        auction.getStatus() + ", End time: " + auction.getEndTime());
                return;
            }

            // Tìm bid cao nhất
            Optional<Bid> highestBidOpt = bidRepository.findHighestBidByAuctionId(auctionId);

            if (highestBidOpt.isPresent()) {
                Bid winningBid = highestBidOpt.get();

                System.out.println("Processing auction end for auction " + auctionId +
                        ", winning bid: " + winningBid.getBidAmount() +
                        " by user " + winningBid.getUserId());

                // Cập nhật bid thắng cuộc
                winningBid.setStatus(BidStatus.WINNING);
                winningBid.setIsWinning(true);
                bidRepository.save(winningBid);

                // Cập nhật tất cả bid khác thành OUTBID
                updateAllOtherBidsToOutbid(auctionId, winningBid.getId());

                // Bây giờ mới cập nhật winner vào auction-service
                WinnerUpdateDTO dto = new WinnerUpdateDTO(winningBid.getUserId());
                auctionServiceClient.updateWinner(auctionId, dto);

                // Gửi notification về winner
                sendWinnerNotification(winningBid);

            } else {
                System.out.println("No bids found for auction " + auctionId);
                // Có thể cập nhật auction status thành NO_BIDS hoặc EXPIRED
            }

        } catch (Exception e) {
            System.err.println("Failed to process auction end for auction " + auctionId + ": " + e.getMessage());
            throw new RuntimeException("Failed to process auction end", e);
        }
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

    // Method gửi notification về winner
    private void sendWinnerNotification(Bid winningBid) {
        try {
            BidResponse bidResponse = mapToBidResponse(winningBid);

            // Gửi BidNotification dạng AUCTION_END
            webSocketService.sendAuctionEndNotification(bidResponse);

            // Gửi thống kê
            IBidService.BidStatistics finalStats = getBidStatistics(winningBid.getAuctionId());
            webSocketService.sendBidStatistics(winningBid.getAuctionId(), finalStats);

        } catch (Exception e) {
            System.err.println("Failed to send winner notification: " + e.getMessage());
        }
    }

    @Override
    public void validateBid(Long auctionId, Long userId, BigDecimal bidAmount) {
        // Null check for parameters
        if (auctionId == null) {
            throw new RuntimeException("Auction ID cannot be null");
        }
        if (userId == null) {
            throw new RuntimeException("User ID cannot be null");
        }
        if (bidAmount == null) {
            throw new RuntimeException("Bid amount cannot be null");
        }

        // Kiểm tra auction có tồn tại và đang active không
        try {
            AuctionServiceClient.AuctionResponse auction = auctionServiceClient.getAuctionById(auctionId);
            if (auction == null) {
                throw new RuntimeException("Auction not found");
            }

            // Kiểm tra auction status - CHỈ CHO PHÉP BID KHI STATUS LÀ "OPENED"
            if (!"OPENED".equals(auction.getStatus())) {
                if ("UPCOMING".equals(auction.getStatus())) {
                    throw new RuntimeException("Auction has not started yet");
                } else if ("ENDED".equals(auction.getStatus()) || "CLOSED".equals(auction.getStatus())) {
                    throw new RuntimeException("Auction has ended");
                } else if ("CANCELLED".equals(auction.getStatus())) {
                    throw new RuntimeException("Auction has been cancelled");
                } else {
                    throw new RuntimeException("Auction is not available for bidding");
                }
            }

            LocalDateTime now = LocalDateTime.now();

            // Kiểm tra thời gian auction - phải nằm trong khoảng startTime đến endTime
            if (auction.getStartTime() != null && auction.getStartTime().isAfter(now)) {
                throw new RuntimeException("Auction has not started yet. Start time: " + auction.getStartTime());
            }

            if (auction.getEndTime() != null && auction.getEndTime().isBefore(now)) {
                throw new RuntimeException("Auction has ended. End time: " + auction.getEndTime());
            }

            // Lấy current highest bid
            BigDecimal currentHighest = getCurrentHighestBid(auctionId);

            // Kiểm tra bid amount phải lớn hơn current bid
            if (currentHighest != null && bidAmount.compareTo(currentHighest) <= 0) {
                throw new RuntimeException("Bid amount must be higher than current highest bid: " + currentHighest);
            }

            // Kiểm tra increment amount
            BigDecimal incrementAmount = auction.getIncrementAmount();
            if (incrementAmount != null && incrementAmount.compareTo(BigDecimal.ZERO) > 0) {
                BigDecimal requiredMinimum;

                if (currentHighest != null) {
                    // Nếu đã có bid, bid mới phải >= currentHighest + incrementAmount
                    requiredMinimum = currentHighest.add(incrementAmount);
                    if (bidAmount.compareTo(requiredMinimum) < 0) {
                        throw new RuntimeException("Bid amount must be at least " + requiredMinimum +
                                " (current highest: " + currentHighest + " + minimum increment: " + incrementAmount + ")");
                    }
                } else {
                    // Nếu chưa có bid nào, bid đầu tiên phải >= startingPrice + incrementAmount (hoặc chỉ >= startingPrice)
                    // Thông thường bid đầu tiên chỉ cần >= startingPrice
                    BigDecimal startingPrice = auction.getStartingPrice();
                    if (startingPrice != null && bidAmount.compareTo(startingPrice) < 0) {
                        throw new RuntimeException("First bid must be at least the starting price: " + startingPrice);
                    }
                }
            }

            // Kiểm tra user đã có bid cao nhất chưa
            validateUserNotAlreadyHighestBidder(auctionId, userId);

            // Kiểm tra bid amount phải lớn hơn hoặc bằng starting bid (với null safety)
            BigDecimal startingPrice = auction.getStartingPrice();
            if (startingPrice != null && bidAmount.compareTo(startingPrice) < 0) {
                throw new RuntimeException("Bid amount must be at least: " + startingPrice);
            } else if (startingPrice == null) {
                System.err.println("Warning: Starting price is null for auction " + auctionId);
            }

            // Kiểm tra user không thể bid vào auction của chính mình
            if (userId.equals(auction.getSellerId())) {
                throw new RuntimeException("You cannot bid on your own auction");
            }

        } catch (Exception e) {
            if (e instanceof RuntimeException) {
                throw e;
            }
            throw new RuntimeException("Failed to validate auction: " + e.getMessage());
        }

        // Kiểm tra user có tồn tại không
        try {
            UserServiceClient.UserResponse user = userServiceClient.getUserById(userId);
            if (user == null) {
                throw new RuntimeException("User not found");
            }
        } catch (Exception e) {
            if (e instanceof RuntimeException) {
                throw e;
            }
            throw new RuntimeException("Failed to validate user: " + e.getMessage());
        }
    }

    // Validate user không phải là người bid cao nhất hiện tại
    private void validateUserNotAlreadyHighestBidder(Long auctionId, Long userId) {
        // Tìm bid cao nhất hiện tại
        Optional<Bid> highestBid = bidRepository.findHighestBidByAuctionId(auctionId);

        if (highestBid.isPresent() && highestBid.get().getUserId().equals(userId)) {
            throw new RuntimeException("You already have the highest bid. Please wait for others to bid higher before placing another bid.");
        }
    }

    //  getCurrentHighestBid để không phụ thuộc vào status
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
                // Sử dụng firstName và lastName trực tiếp
                firstName = user.getFirstName() != null ? user.getFirstName() : "";
                lastName = user.getLastName() != null ? user.getLastName() : "";

                // Fallback to fullName nếu firstName/lastName null
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
            // Tạo BidResponse để gửi qua WebSocket
            BidResponse bidResponse = mapToBidResponse(bid);

            // Gửi notification qua WebSocketService
            webSocketService.sendNewBidNotification(bidResponse);

            // Gửi thông tin statistics update
            IBidService.BidStatistics stats = getBidStatistics(bid.getAuctionId());
            webSocketService.sendBidStatistics(bid.getAuctionId(), stats);

        } catch (Exception e) {
            System.err.println("Failed to send realtime update: " + e.getMessage());
            throw e;
        }
    }

    @Override
    public List<Bid> getBidsByAuction(Long auctionId) {
        List<Bid> bids = bidRepository.findByAuctionIdOrderByBidAmountDesc(auctionId);
        bids.forEach(this::enrichBidWithExternalData);
        return bids;
    }

    @Override
    public List<Bid> getBidHistory(Long auctionId) {
        List<Bid> bids = bidRepository.findBidHistoryByAuctionId(auctionId);
        bids.forEach(this::enrichBidWithExternalData);
        return bids;
    }

    @Override
    public List<Bid> getBidsByUser(Long userId) {
        List<Bid> bids = bidRepository.findByUserIdOrderByCreatedAtDesc(userId);
        bids.forEach(this::enrichBidWithExternalData);
        return bids;
    }

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