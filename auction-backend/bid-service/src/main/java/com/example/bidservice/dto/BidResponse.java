package com.example.bidservice.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BidResponse {
    private Long id;
    private Long auctionId;
    private Long userId;
    private String firstName;
    private String lastName;
    private BigDecimal bidAmount;
    private LocalDateTime bidTime;
    private Boolean isWinning;
    private String status;

    public BidResponse() {}

    public BidResponse(Long id, Long auctionId, Long userId, String firstName, String lastName,
                       BigDecimal bidAmount, LocalDateTime bidTime, Boolean isWinning, String status) {
        this.id = id;
        this.auctionId = auctionId;
        this.userId = userId;
        this.firstName = firstName;
        this.lastName = lastName;
        this.bidAmount = bidAmount;
        this.bidTime = bidTime;
        this.isWinning = isWinning;
        this.status = status;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

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

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public BigDecimal getBidAmount() {
        return bidAmount;
    }

    public void setBidAmount(BigDecimal bidAmount) {
        this.bidAmount = bidAmount;
    }

    public LocalDateTime getBidTime() {
        return bidTime;
    }

    public void setBidTime(LocalDateTime bidTime) {
        this.bidTime = bidTime;
    }

    public Boolean getIsWinning() {
        return isWinning;
    }

    public void setIsWinning(Boolean isWinning) {
        this.isWinning = isWinning;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
