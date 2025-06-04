package com.example.bidservice.client;

import com.example.bidservice.config.FeignClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

// Auction Service Client
@FeignClient(name = "auction-service", url = "${app.services.auction-service}", configuration = FeignClientConfig.class)
public interface AuctionServiceClient {

    @GetMapping("/api/auctions/{id}")
    AuctionResponse getAuctionById(@PathVariable("id") Long id);

    @PutMapping("/api/auctions/{id}/current-bid")
    void updateCurrentBid(@PathVariable("id") Long auctionId,
                          @RequestParam("currentBid") java.math.BigDecimal currentBid,
                          @RequestParam("bidCount") Integer bidCount);

    @PutMapping("/api/auctions/{id}/winner")
    void updateWinner(@PathVariable("id") Long auctionId, @RequestParam("winnerId") Long winnerId);



    // DTO - chỉ lấy những fields cần thiết cho BidService
    class AuctionResponse {
        private Long id;
        private String title;                              // Dùng trong enrichBidWithExternalData()
        private java.math.BigDecimal startingPrice;       // Dùng trong validateBid()
        private java.time.LocalDateTime endTime;          // Dùng trong validateBid()
        private String status;                            // Dùng trong validateBid()
        private Long sellerId;                            // Dùng trong validateBid()

        // Constructors
        public AuctionResponse() {}

        // Getters and Setters - chỉ cho những fields cần thiết
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getTitle() { return title; }
        public void setTitle(String title) { this.title = title; }

        public java.math.BigDecimal getStartingPrice() { return startingPrice; }
        public void setStartingPrice(java.math.BigDecimal startingPrice) { this.startingPrice = startingPrice; }

        public java.time.LocalDateTime getEndTime() { return endTime; }
        public void setEndTime(java.time.LocalDateTime endTime) { this.endTime = endTime; }

        public String getStatus() { return status; }
        public void setStatus(String status) { this.status = status; }

        public Long getSellerId() { return sellerId; }
        public void setSellerId(Long sellerId) { this.sellerId = sellerId; }
    }
}