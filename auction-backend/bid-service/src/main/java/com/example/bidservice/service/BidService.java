package com.example.bidservice.service;

import com.example.bidservice.client.AuctionServiceClient;
import com.example.bidservice.client.UserServiceClient;
import com.example.bidservice.dto.BidResponse;
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

    @Override
    public Bid createBid(Long auctionId, Long userId, BigDecimal bidAmount) {
        // 1. Validate bid
        validateBid(auctionId, userId, bidAmount);

        // 2. Tạo bid mới với trạng thái WINNING (vì là bid cao nhất hiện tại)
        Bid newBid = new Bid(auctionId, userId, bidAmount);
        newBid.setStatus(BidStatus.WINNING);
        newBid.setIsWinning(true);

        Bid savedBid = bidRepository.save(newBid);

        // 3. Cập nhật trạng thái các bid cũ thành OUTBID
        updatePreviousBidsToOutbid(auctionId, savedBid.getId());

        // 4. Cập nhật winnerId vào auction-service
        try {
            auctionServiceClient.updateWinner(auctionId, userId);
        } catch (Exception e) {
            System.err.println("Failed to update winner in auction-service: " + e.getMessage());
            // Đánh dấu bid là failed nếu không thể cập nhật winner
            savedBid.setStatus(BidStatus.FAILED);
            savedBid.setIsWinning(false);
            bidRepository.save(savedBid);
            throw new RuntimeException("Failed to update auction winner", e);
        }

        // 5. Lấy thông tin user và auction để enrich
        enrichBidWithExternalData(savedBid);

        // 6. Gửi thông báo realtime qua WebSocketService
        sendRealtimeBidUpdate(savedBid);

        return savedBid;
    }

    // Phương thức helper để cập nhật trạng thái bid cũ
    private void updatePreviousBidsToOutbid(Long auctionId, Long currentBidId) {
        // Tìm tất cả bid đang WINNING hoặc ACTIVE trong auction này (trừ bid hiện tại)
        List<Bid> previousWinningBids = bidRepository.findByAuctionIdAndIdNotAndStatus(
                auctionId, currentBidId, BidStatus.WINNING);

        // Có thể cần thêm query cho ACTIVE bids nếu có
        // List<Bid> activeBids = bidRepository.findByAuctionIdAndIdNotAndStatus(
        //     auctionId, currentBidId, BidStatus.ACTIVE);

        for (Bid bid : previousWinningBids) {
            bid.setStatus(BidStatus.OUTBID);
            bid.setIsWinning(false);
        }

        if (!previousWinningBids.isEmpty()) {
            bidRepository.saveAll(previousWinningBids);
        }
    }

    @Override
    public void validateBid(Long auctionId, Long userId, BigDecimal bidAmount) {
        // Kiểm tra auction có tồn tại và đang active không
        try {
            AuctionServiceClient.AuctionResponse auction = auctionServiceClient.getAuctionById(auctionId);
            if (auction == null) {
                throw new RuntimeException("Auction not found");
            }

            // Kiểm tra auction status
            if ("ENDED".equals(auction.getStatus()) || "CANCELLED".equals(auction.getStatus())) {
                throw new RuntimeException("Auction is not active");
            }

            // Kiểm tra thời gian auction
            if (auction.getEndTime() != null && auction.getEndTime().isBefore(LocalDateTime.now())) {
                throw new RuntimeException("Auction has ended");
            }

            // Kiểm tra bid amount phải lớn hơn current bid
            BigDecimal currentHighest = getCurrentHighestBid(auctionId);
            if (currentHighest != null && bidAmount.compareTo(currentHighest) <= 0) {
                throw new RuntimeException("Bid amount must be higher than current highest bid: " + currentHighest);
            }

            // Kiểm tra bid amount phải lớn hơn hoặc bằng starting bid
            if (bidAmount.compareTo(auction.getStartingBid()) < 0) {
                throw new RuntimeException("Bid amount must be at least: " + auction.getStartingBid());
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

    @Override
    public BigDecimal getCurrentHighestBid(Long auctionId) {
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
        List<Bid> bids = bidRepository.findTop10ByAuctionIdOrderByCreatedAtDesc(auctionId);
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
                    String fullName = (user.getFirstName() != null ? user.getFirstName() : "") +
                            " " + (user.getLastName() != null ? user.getLastName() : "");
                    stats.setHighestBidder(fullName.trim());
                }
            } catch (Exception e) {
                System.err.println("Failed to get user info: " + e.getMessage());
            }
            stats.setHighestBidTime(bid.getCreatedAt());
        }

        return stats;
    }

    // Helper methods
    public boolean hasUserBidOnAuction(Long auctionId, Long userId) {
        return bidRepository.existsByAuctionIdAndUserId(auctionId, userId);
    }

    public Optional<Bid> getLastBidByUserAndAuction(Long auctionId, Long userId) {
        List<Bid> userBids = bidRepository.findByAuctionIdAndUserIdOrderByCreatedAtDesc(auctionId, userId);
        return userBids.isEmpty() ? Optional.empty() : Optional.of(userBids.get(0));
    }

    public long getUniqueBiddersCount(Long auctionId) {
        return bidRepository.findByAuctionIdOrderByBidAmountDesc(auctionId)
                .stream()
                .map(Bid::getUserId)
                .distinct()
                .count();
    }
}