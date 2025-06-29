package com.example.auction.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.math.BigDecimal;

@FeignClient(name = "bid-service")
public interface BidServiceClient {

    @PostMapping("/api/bids/auction/{auctionId}/update-current-bid")
    void updateCurrentBid(@PathVariable Long auctionId,
                          @RequestParam BigDecimal currentBid,
                          @RequestParam int bidCount);

    @GetMapping("/api/bids/auction/{auctionId}/winner")
    WinnerResponse getWinnerByAuctionId(@PathVariable Long auctionId);

    @PostMapping("/api/bids/auction/{auctionId}/process-end")
    void processAuctionEnd(@PathVariable Long auctionId);

    class WinnerResponse {
        private Long userId;
        private String bidAmount;
        private String bidTime;

        public WinnerResponse() {}

        public WinnerResponse(Long userId, String bidAmount, String bidTime) {
            this.userId = userId;
            this.bidAmount = bidAmount;
            this.bidTime = bidTime;
        }

        // Getters and Setters
        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public String getBidAmount() { return bidAmount; }
        public void setBidAmount(String bidAmount) { this.bidAmount = bidAmount; }

        public String getBidTime() { return bidTime; }
        public void setBidTime(String bidTime) { this.bidTime = bidTime; }
    }
}
