package com.example.auction.dto;

import com.example.auction.validator.ValidAuctionTime;
import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@ValidAuctionTime(minGapMinutes = 60, message = "End time must be after start time")
public class AuctionRequestDTO {

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Seller ID is required")
    private Long sellerId;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotNull(message = "Start time is required")
    @Future(message = "Start time must be in the future")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    @Future(message = "End time must be in the future")
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd'T'HH:mm")
    private LocalDateTime endTime;

    @NotNull(message = "Starting price is required")
    private BigDecimal startingPrice;

    @NotNull(message = "Increment amount is required")
    private BigDecimal incrementAmount;

    // Optional: current bid if provided at creation
    private BigDecimal currentBid;

    private Boolean requiresDeposit = false;
    private BigDecimal securityDeposit;

    // Status as string for easier client usage; converted in the controller
    private String status;

    // Optional: initial bid count
    private Integer bidCount;

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Long getSellerId() {
        return sellerId;
    }

    public void setSellerId(Long sellerId) {
        this.sellerId = sellerId;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

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

    public BigDecimal getIncrementAmount() {
        return incrementAmount;
    }

    public void setIncrementAmount(BigDecimal incrementAmount) {
        this.incrementAmount = incrementAmount;
    }

    public BigDecimal getCurrentBid() {
        return currentBid;
    }

    public void setCurrentBid(BigDecimal currentBid) {
        this.currentBid = currentBid;
    }

    public Boolean getRequiresDeposit() {
        return requiresDeposit;
    }

    public void setRequiresDeposit(Boolean requiresDeposit) {
        this.requiresDeposit = requiresDeposit;
    }

    public BigDecimal getSecurityDeposit() {
        return securityDeposit;
    }

    public void setSecurityDeposit(BigDecimal securityDeposit) {
        this.securityDeposit = securityDeposit;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Integer getBidCount() {
        return bidCount;
    }

    public void setBidCount(Integer bidCount) {
        this.bidCount = bidCount;
    }

    public AuctionRequestDTO() {
    }

    public AuctionRequestDTO(String title, String description, Long sellerId, Long categoryId, LocalDateTime startTime, LocalDateTime endTime, BigDecimal startingPrice, BigDecimal incrementAmount, BigDecimal currentBid, Boolean requiresDeposit, BigDecimal securityDeposit, String status, Integer bidCount) {
        this.title = title;
        this.description = description;
        this.sellerId = sellerId;
        this.categoryId = categoryId;
        this.startTime = startTime;
        this.endTime = endTime;
        this.startingPrice = startingPrice;
        this.incrementAmount = incrementAmount;
        this.currentBid = currentBid;
        this.requiresDeposit = requiresDeposit;
        this.securityDeposit = securityDeposit;
        this.status = status;
        this.bidCount = bidCount;
    }
}
