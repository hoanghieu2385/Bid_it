package com.example.bidservice.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * DTO duy nhất cho cả RabbitMQ và WebSocket.
 */
public class BidNotification {

    @JsonProperty("auctionId")
    private Long auctionId;

    @JsonProperty("type")
    private String type; // NEW_BID, OUTBID, WINNER, BID_FAILED

    @JsonProperty("bidInfo")
    private BidResponse bidInfo;

    @JsonProperty("currentHighestBid")
    private BigDecimal currentHighestBid;

    @JsonProperty("message")
    private String message;

    @JsonProperty("timestamp")
    private LocalDateTime timestamp;

    public BidNotification() {}

    public BidNotification(Long auctionId, String type, BidResponse bidInfo,
                           BigDecimal currentHighestBid, String message) {
        this.auctionId = auctionId;
        this.type = type;
        this.bidInfo = bidInfo;
        this.currentHighestBid = currentHighestBid;
        this.message = message;
        this.timestamp = LocalDateTime.now();
    }

    // Factory methods
    public static BidNotification newBid(Long auctionId, BidResponse bidInfo) {
        return new BidNotification(
                auctionId,
                "NEW_BID",
                bidInfo,
                bidInfo.getBidAmount(),
                "New bid placed!"
        );
    }

    public static BidNotification outbid(Long auctionId, BigDecimal newHighestBid, Long outbidUserId) {
        BidResponse dummy = new BidResponse();
        dummy.setAuctionId(auctionId);
        dummy.setUserId(outbidUserId);
        return new BidNotification(
                auctionId,
                "OUTBID",
                dummy,
                newHighestBid,
                "You have been outbid!"
        );
    }

    public static BidNotification winner(Long auctionId, BidResponse winningBid) {
        return new BidNotification(
                auctionId,
                "WINNER",
                winningBid,
                winningBid.getBidAmount(),
                "You are the winner!"
        );
    }

    public static BidNotification bidFailed(Long auctionId, String errorMessage) {
        return new BidNotification(
                auctionId,
                "BID_FAILED",
                null,
                null,
                errorMessage
        );
    }

    // Getters & setters

    public Long getAuctionId() { return auctionId; }
    public void setAuctionId(Long auctionId) { this.auctionId = auctionId; }

    public String getType() { return type; }
    public void setType(String type) { this.type = type; }

    public BidResponse getBidInfo() { return bidInfo; }
    public void setBidInfo(BidResponse bidInfo) { this.bidInfo = bidInfo; }

    public BigDecimal getCurrentHighestBid() { return currentHighestBid; }
    public void setCurrentHighestBid(BigDecimal currentHighestBid) { this.currentHighestBid = currentHighestBid; }

    public String getMessage() { return message; }
    public void setMessage(String message) { this.message = message; }

    public LocalDateTime getTimestamp() { return timestamp; }
    public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

    @Override
    public String toString() {
        return "BidNotification{" +
                "auctionId=" + auctionId +
                ", type='" + type + '\'' +
                ", bidInfo=" + bidInfo +
                ", currentHighestBid=" + currentHighestBid +
                ", message='" + message + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}
