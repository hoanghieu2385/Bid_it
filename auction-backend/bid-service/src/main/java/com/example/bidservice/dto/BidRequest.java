package com.example.bidservice.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import java.math.BigDecimal;

public class BidRequest {

    @NotNull(message = "Auction ID is required")
    private Long auctionId;

    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Bid amount is required")
    @Positive(message = "Bid amount must be positive")
    private BigDecimal bidAmount;

    public BidRequest() {}

    public BidRequest(Long auctionId, Long userId, BigDecimal bidAmount) {
        this.auctionId = auctionId;
        this.userId = userId;
        this.bidAmount = bidAmount;
    }

    // Getters and Setters
    public Long getAuctionId() {
        return auctionId;
    }

    public void setAuctionId(Long auctionId) {
        this.auctionId = auctionId;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public BigDecimal getBidAmount() {
        return bidAmount;
    }

    public void setBidAmount(BigDecimal bidAmount) {
        this.bidAmount = bidAmount;
    }
}