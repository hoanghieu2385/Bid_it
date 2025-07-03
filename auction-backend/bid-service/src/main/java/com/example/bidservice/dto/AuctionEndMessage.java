package com.example.bidservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.time.LocalDateTime;

public class AuctionEndMessage {
    @JsonProperty("auctionId")
    private Long auctionId;

    @JsonProperty("winnerId")
    private Long winnerId;

    @JsonProperty("endTime")
    private LocalDateTime endTime;

    @JsonProperty("reason")
    private String reason; // TIME_EXPIRED, MANUAL_CLOSE, etc.

    @JsonProperty("timestamp")
    private LocalDateTime timestamp;

    // Constructors
    public AuctionEndMessage() {
    }

    public AuctionEndMessage(Long auctionId, Long winnerId, String reason) {
        this.auctionId = auctionId;
        this.winnerId = winnerId;
        this.reason = reason;
        this.endTime = LocalDateTime.now();
        this.timestamp = LocalDateTime.now();
    }

    // Getters & Setters
    public Long getAuctionId() {
        return auctionId;
    }

    public void setAuctionId(Long auctionId) {
        this.auctionId = auctionId;
    }

    public Long getWinnerId() {
        return winnerId;
    }

    public void setWinnerId(Long winnerId) {
        this.winnerId = winnerId;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public String getReason() {
        return reason;
    }

    public void setReason(String reason) {
        this.reason = reason;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "AuctionEndMessage{" +
                "auctionId=" + auctionId +
                ", winnerId=" + winnerId +
                ", endTime=" + endTime +
                ", reason='" + reason + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}