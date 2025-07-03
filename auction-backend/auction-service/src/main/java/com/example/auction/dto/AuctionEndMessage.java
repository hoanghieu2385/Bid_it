package com.example.auction.dto;

import java.io.Serializable;
import java.time.LocalDateTime;

public class AuctionEndMessage implements Serializable {

    private Long auctionId;
    private String reason;
    private LocalDateTime timestamp;

    public AuctionEndMessage() {
    }

    public AuctionEndMessage(Long auctionId, String reason) {
        this.auctionId = auctionId;
        this.reason = reason;
        this.timestamp = LocalDateTime.now();
    }

    public Long getAuctionId() {
        return auctionId;
    }

    public void setAuctionId(Long auctionId) {
        this.auctionId = auctionId;
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
                ", reason='" + reason + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}
