package com.example.auction.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "bid-service")
public interface BidServiceClient {

    @GetMapping("/api/bids/auction/{auctionId}/winner")
    WinnerInfo getWinnerByAuctionId(@PathVariable("auctionId") Long auctionId);

    class WinnerInfo {
        private Long userId;
        private String bidAmount;
        private String bidTime;

        // Getters and setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public String getBidAmount() { return bidAmount; }
        public void setBidAmount(String bidAmount) { this.bidAmount = bidAmount; }

        public String getBidTime() { return bidTime; }
        public void setBidTime(String bidTime) { this.bidTime = bidTime; }
    }
}
