package com.example.bidservice.dto;

import java.math.BigDecimal;

public class BidNotification {
    private String type; // "NEW_BID", "AUCTION_END", "OUTBID"
    private Long auctionId;
    private BidResponse bidInfo;
    private BigDecimal currentHighestBid;
    private String message;

    public BidNotification() {}

    public static BidNotification newBid(Long auctionId, BidResponse bidInfo) {
        BidNotification notification = new BidNotification();
        notification.setType("NEW_BID");
        notification.setAuctionId(auctionId);
        notification.setBidInfo(bidInfo);
        notification.setCurrentHighestBid(bidInfo.getBidAmount());
        notification.setMessage("New bid placed!");
        return notification;
    }

    public static BidNotification bidFailed(Long auctionId, String errorMessage) {
        BidNotification notification = new BidNotification();
        notification.setType("BID_FAILED");
        notification.setAuctionId(auctionId);
        notification.setMessage(errorMessage);
        return notification;
    }

    public static BidNotification outbid(Long auctionId, BigDecimal newHighestBid) {
        BidNotification notification = new BidNotification();
        notification.setType("OUTBID");
        notification.setAuctionId(auctionId);
        notification.setCurrentHighestBid(newHighestBid);
        notification.setMessage("You have been outbid!");
        return notification;
    }

    public static BidNotification auctionEnd(Long auctionId, BidResponse winningBid) {
        BidNotification notification = new BidNotification();
        notification.setType("AUCTION_END");
        notification.setAuctionId(auctionId);
        notification.setBidInfo(winningBid);
        notification.setCurrentHighestBid(winningBid != null ? winningBid.getBidAmount() : null);
        notification.setMessage("Auction has ended!");
        return notification;
    }

    // Getters and Setters
    public String getType() {
        return type;
    }

    public void setType(String type) {
        this.type = type;
    }

    public Long getAuctionId() {
        return auctionId;
    }

    public void setAuctionId(Long auctionId) {
        this.auctionId = auctionId;
    }

    public BidResponse getBidInfo() {
        return bidInfo;
    }

    public void setBidInfo(BidResponse bidInfo) {
        this.bidInfo = bidInfo;
    }

    public BigDecimal getCurrentHighestBid() {
        return currentHighestBid;
    }

    public void setCurrentHighestBid(BigDecimal currentHighestBid) {
        this.currentHighestBid = currentHighestBid;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}