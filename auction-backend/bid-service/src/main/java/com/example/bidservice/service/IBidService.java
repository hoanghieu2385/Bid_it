package com.example.bidservice.service;

import com.example.bidservice.entity.Bid;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public interface IBidService {

    /**
     * Tạo bid mới
     * @param auctionId ID của auction
     * @param userId ID của user
     * @param bidAmount Số tiền bid
     * @return Bid đã được tạo
     * @throws RuntimeException nếu có lỗi validation hoặc tạo bid
     */
    Bid createBid(Long auctionId, Long userId, BigDecimal bidAmount);

    /**
     * Lấy bid cao nhất hiện tại của auction
     * @param auctionId ID của auction
     * @return Số tiền bid cao nhất, null nếu chưa có bid nào
     */
    BigDecimal getCurrentHighestBid(Long auctionId);

    /**
     * Lấy danh sách tất cả bid của auction theo thứ tự giảm dần
     * @param auctionId ID của auction
     * @return Danh sách bid
     */
    List<Bid> getBidsByAuction(Long auctionId);

    /**
     * Lấy lịch sử bid gần nhất của auction (10 bid gần nhất)
     * @param auctionId ID của auction
     * @return Danh sách bid gần nhất
     */
    List<Bid> getBidHistory(Long auctionId);

    /**
     * Lấy danh sách bid của user
     * @param userId ID của user
     * @return Danh sách bid của user
     */
    List<Bid> getBidsByUser(Long userId);

    /**
     * Lấy thống kê bid của auction
     * @param auctionId ID của auction
     * @return Thống kê bid
     */
    IBidService.BidStatistics getBidStatistics(Long auctionId);

    /**
     * Validate bid trước khi tạo
     * @param auctionId ID của auction
     * @param userId ID của user
     * @param bidAmount Số tiền bid
     * @throws RuntimeException nếu validation fail
     */
    void validateBid(Long auctionId, Long userId, BigDecimal bidAmount);

    /**
     * Gửi thông báo realtime khi có bid mới
     * @param bid Bid vừa được tạo
     */
    void sendRealtimeBidUpdate(Bid bid);

    /**
     * Lấy thông tin chi tiết cho bid (user info, auction info)
     * @param bid Bid cần lấy thông tin
     * @return Bid đã được enrich với thông tin
     */
    Bid enrichBidWithExternalData(Bid bid);

    // Inner class cho statistics
    class BidStatistics {
        private Long auctionId;
        private long totalBids;
        private BigDecimal highestBid;
        private String highestBidder;
        private LocalDateTime highestBidTime;

        // Constructors
        public BidStatistics() {}

        public BidStatistics(Long auctionId, long totalBids, BigDecimal highestBid,
                             String highestBidder, LocalDateTime highestBidTime) {
            this.auctionId = auctionId;
            this.totalBids = totalBids;
            this.highestBid = highestBid;
            this.highestBidder = highestBidder;
            this.highestBidTime = highestBidTime;
        }

        // Getters and setters
        public Long getAuctionId() { return auctionId; }
        public void setAuctionId(Long auctionId) { this.auctionId = auctionId; }

        public long getTotalBids() { return totalBids; }
        public void setTotalBids(long totalBids) { this.totalBids = totalBids; }

        public BigDecimal getHighestBid() { return highestBid; }
        public void setHighestBid(BigDecimal highestBid) { this.highestBid = highestBid; }

        public String getHighestBidder() { return highestBidder; }
        public void setHighestBidder(String highestBidder) { this.highestBidder = highestBidder; }

        public LocalDateTime getHighestBidTime() { return highestBidTime; }
        public void setHighestBidTime(LocalDateTime highestBidTime) { this.highestBidTime = highestBidTime; }
    }
}