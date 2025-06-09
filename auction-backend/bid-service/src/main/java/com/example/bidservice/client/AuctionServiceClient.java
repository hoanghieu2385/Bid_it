package com.example.bidservice.client;

import com.example.bidservice.config.FeignClientConfig;
import com.example.bidservice.dto.WinnerUpdateDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

// Auction Service Client
@FeignClient(name = "auction-service", url = "${app.services.auction-service}", configuration = FeignClientConfig.class)
public interface AuctionServiceClient {

    @GetMapping("/api/auctions/{id}")
    AuctionResponse getAuctionById(@PathVariable("id") Long id);

    @PutMapping("/api/auctions/{id}/current-bid")
    void updateCurrentBid(@PathVariable("id") Long auctionId,
                          @RequestParam("currentBid") java.math.BigDecimal currentBid,
                          @RequestParam("bidCount") Integer bidCount);

    @PutMapping("/api/auctions/{auctionId}/winner")
    void updateWinner(@PathVariable Long auctionId, @RequestBody WinnerUpdateDTO dto);

    // DTO - chỉ lấy những fields cần thiết cho BidService
    class AuctionResponse {
        private Long id;
        private String title;                               // Dùng trong enrichBidWithExternalData()
        private java.math.BigDecimal startingPrice;         // Dùng trong validateBid()
        private java.math.BigDecimal incrementAmount;       // Dùng trong validateBid()
        private java.time.LocalDateTime startTime;          // Dùng trong validateBid()
        private java.time.LocalDateTime endTime;            // Dùng trong validateBid()
        private String status;                              // Dùng trong validateBid()
        private Long sellerId;                              // Dùng trong validateBid()
        private Long winnerId;

        // Constructors
        public AuctionResponse() {}

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public java.math.BigDecimal getStartingPrice() { return startingPrice; }
        public void setStartingPrice(java.math.BigDecimal startingPrice) { this.startingPrice = startingPrice; }

        public java.math.BigDecimal getIncrementAmount() { return incrementAmount; }
        public void setIncrementAmount(java.math.BigDecimal incrementAmount) { this.incrementAmount = incrementAmount; }

        public java.time.LocalDateTime getStartTime() { return startTime; }
        public void setStartTime(java.time.LocalDateTime startTime) { this.startTime = startTime; }

        public java.time.LocalDateTime getEndTime() { return endTime; }
        public void setEndTime(java.time.LocalDateTime endTime) { this.endTime = endTime; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public Long getSellerId() { return sellerId; }
        public void setSellerId(Long sellerId) { this.sellerId = sellerId; }

        public Long getWinnerId() { return winnerId; }
        public void setWinnerId(Long winnerId) { this.winnerId = winnerId; }
    }
}