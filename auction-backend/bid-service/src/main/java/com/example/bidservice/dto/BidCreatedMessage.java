package com.example.bidservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Message DTO cho RabbitMQ khi có bid mới
 */
public class BidCreatedMessage {
    @JsonProperty("auctionId")
    private Long auctionId;

    @JsonProperty("userId")
    private Long userId;

    @JsonProperty("bidAmount")
    private BigDecimal bidAmount;

    @JsonProperty("bidId")
    private Long bidId;

    @JsonProperty("timestamp")
    private LocalDateTime timestamp;

    @JsonProperty("retryCount")
    private int retryCount = 0;

    // Constructors
    public BidCreatedMessage() {}

    public BidCreatedMessage(Long auctionId, Long userId, BigDecimal bidAmount, Long bidId) {
        this.auctionId = auctionId;
        this.userId = userId;
        this.bidAmount = bidAmount;
        this.bidId = bidId;
        this.timestamp = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getAuctionId() { return auctionId; }
    public void setAuctionId(Long auctionId) { this.auctionId = auctionId; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public BigDecimal getBidAmount() { return bidAmount; }
    public void setBidAmount(BigDecimal bidAmount) { this.bidAmount = bidAmount; }

    public Long getBidId() { return bidId; }
    public void setBidId(Long bidId) { this.bidId = bidId; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    public int getRetryCount() { return retryCount; }
    public void setRetryCount(int retryCount) { this.retryCount = retryCount; }

    @Override
    public String toString() {
        return "BidCreatedMessage{" +
                "auctionId=" + auctionId +
                ", userId=" + userId +
                ", bidAmount=" + bidAmount +
                ", bidId=" + bidId +
                ", timestamp=" + timestamp +
                ", retryCount=" + retryCount +
                '}';
    }
}