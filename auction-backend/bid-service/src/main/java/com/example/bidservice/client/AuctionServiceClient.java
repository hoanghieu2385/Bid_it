package com.example.bidservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

// Auction Service Client
@FeignClient(name = "auction-service", url = "${app.services.auction-service}")
public interface AuctionServiceClient {

    @GetMapping("/api/auctions/{id}")
    AuctionResponse getAuctionById(@PathVariable("id") Long id);

    @PutMapping("/api/auctions/{id}/winner")
    void updateWinner(@PathVariable("id") Long auctionId, @RequestParam("winnerId") Long winnerId);

    // DTO cho Auction response
    class AuctionResponse {
        private Long id;
        private String title;
        private String description;
        private java.math.BigDecimal startingBid;
        private java.math.BigDecimal currentBid;
        private java.time.LocalDateTime startTime;
        private java.time.LocalDateTime endTime;
        private String status;
        private Long sellerId;

        // Constructors
        public AuctionResponse() {}

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }

        public java.math.BigDecimal getStartingBid() { return startingBid; }
        public void setStartingBid(java.math.BigDecimal startingBid) { this.startingBid = startingBid; }

        public java.math.BigDecimal getCurrentBid() { return currentBid; }
        public void setCurrentBid(java.math.BigDecimal currentBid) { this.currentBid = currentBid; }

        public java.time.LocalDateTime getStartTime() { return startTime; }
        public void setStartTime(java.time.LocalDateTime startTime) { this.startTime = startTime; }

        public java.time.LocalDateTime getEndTime() { return endTime; }
        public void setEndTime(java.time.LocalDateTime endTime) { this.endTime = endTime; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public Long getSellerId() { return sellerId; }
        public void setSellerId(Long sellerId) { this.sellerId = sellerId; }
    }
}