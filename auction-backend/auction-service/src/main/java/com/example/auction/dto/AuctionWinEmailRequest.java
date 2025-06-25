package com.example.auction.dto;

public class AuctionWinEmailRequest {
    private String email;
    private String auctionTitle;
    private String auctionIdOrSlug;
    private String imageUrl;
    private double finalPrice;

    public AuctionWinEmailRequest() {
    }

    public AuctionWinEmailRequest(String email, String auctionTitle, String auctionIdOrSlug, String imageUrl, double finalPrice) {
        this.email = email;
        this.auctionTitle = auctionTitle;
        this.auctionIdOrSlug = auctionIdOrSlug;
        this.imageUrl = imageUrl;
        this.finalPrice = finalPrice;
    }

    // Getters and Setters

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getAuctionTitle() {
        return auctionTitle;
    }

    public void setAuctionTitle(String auctionTitle) {
        this.auctionTitle = auctionTitle;
    }

    public String getAuctionIdOrSlug() {
        return auctionIdOrSlug;
    }

    public void setAuctionIdOrSlug(String auctionIdOrSlug) {
        this.auctionIdOrSlug = auctionIdOrSlug;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public void setImageUrl(String imageUrl) {
        this.imageUrl = imageUrl;
    }

    public double getFinalPrice() {
        return finalPrice;
    }

    public void setFinalPrice(double finalPrice) {
        this.finalPrice = finalPrice;
    }
}
