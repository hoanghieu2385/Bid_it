package com.example.bid.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AuctionDTO {

    private Long id;
    private String title;
    private Long userId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BigDecimal startingPrice;
    private BigDecimal currentBid;
    private String status;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {return title;}

    public void setTitle(String title) {this.title = title;}

    public Long getUserId() {return userId;}

    public void setUserId(Long userId) {this.userId = userId;}

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public BigDecimal getStartingPrice() {
        return startingPrice;
    }

    public void setStartingPrice(BigDecimal startingPrice) {
        this.startingPrice = startingPrice;
    }

    public BigDecimal getCurrentBid() {
        return currentBid;
    }

    public void setCurrentBid(BigDecimal currentBid) {
        this.currentBid = currentBid;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
