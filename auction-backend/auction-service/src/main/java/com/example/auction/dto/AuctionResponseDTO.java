package com.example.auction.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class AuctionResponseDTO {

    private Long id;
    private String title;
    private String description;
    private Long sellerId;
    private Long categoryId;
    private LocalDateTime startTime;
    private LocalDateTime endTime;
    private BigDecimal startingPrice;
    private BigDecimal incrementAmount;
    private BigDecimal currentBid;
    private Boolean requiresDeposit;
    private BigDecimal securityDeposit;
    private String status;
    private Integer bidCount;
    private Long winnerId;
    private LocalDateTime winnerPaymentDeadline;
    private LocalDateTime disputeRequestDeadline;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime deletedAt;

    // Private constructor for Builder
    private AuctionResponseDTO(Builder builder) {
        this.id = builder.id;
        this.title = builder.title;
        this.description = builder.description;
        this.sellerId = builder.sellerId;
        this.categoryId = builder.categoryId;
        this.startTime = builder.startTime;
        this.endTime = builder.endTime;
        this.startingPrice = builder.startingPrice;
        this.incrementAmount = builder.incrementAmount;
        this.currentBid = builder.currentBid;
        this.requiresDeposit = builder.requiresDeposit;
        this.securityDeposit = builder.securityDeposit;
        this.status = builder.status;
        this.bidCount = builder.bidCount;
        this.winnerId = builder.winnerId;
        this.winnerPaymentDeadline = builder.winnerPaymentDeadline;
        this.disputeRequestDeadline = builder.disputeRequestDeadline;
        this.createdAt = builder.createdAt;
        this.updatedAt = builder.updatedAt;
        this.deletedAt = builder.deletedAt;
    }

    // Getters
    public Long getId() {
        return id;
    }

    public String getTitle() {
        return title;
    }

    public String getDescription() {
        return description;
    }

    public Long getSellerId() {
        return sellerId;
    }

    public Long getCategoryId() {
        return categoryId;
    }

    public LocalDateTime getStartTime() {
        return startTime;
    }

    public LocalDateTime getEndTime() {
        return endTime;
    }

    public BigDecimal getStartingPrice() {
        return startingPrice;
    }

    public BigDecimal getIncrementAmount() {
        return incrementAmount;
    }

    public BigDecimal getCurrentBid() {
        return currentBid;
    }

    public Boolean getRequiresDeposit() {
        return requiresDeposit;
    }

    public BigDecimal getSecurityDeposit() {
        return securityDeposit;
    }

    public String getStatus() {
        return status;
    }

    public Integer getBidCount() {
        return bidCount;
    }

    public Long getWinnerId() {
        return winnerId;
    }

    public LocalDateTime getWinnerPaymentDeadline() {
        return winnerPaymentDeadline;
    }

    public LocalDateTime getDisputeRequestDeadline() {
        return disputeRequestDeadline;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public LocalDateTime getDeletedAt() {
        return deletedAt;
    }

    // Builder class
    public static class Builder {
        private Long id;
        private String title;
        private String description;
        private Long sellerId;
        private Long categoryId;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private BigDecimal startingPrice;
        private BigDecimal incrementAmount;
        private BigDecimal currentBid;
        private Boolean requiresDeposit;
        private BigDecimal securityDeposit;
        private String status;
        private Integer bidCount;
        private Long winnerId;
        private LocalDateTime winnerPaymentDeadline;
        private LocalDateTime disputeRequestDeadline;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private LocalDateTime deletedAt;

        public Builder id(Long id) {
            this.id = id;
            return this;
        }

        public Builder title(String title) {
            this.title = title;
            return this;
        }

        public Builder description(String description) {
            this.description = description;
            return this;
        }

        public Builder sellerId(Long sellerId) {
            this.sellerId = sellerId;
            return this;
        }

        public Builder categoryId(Long categoryId) {
            this.categoryId = categoryId;
            return this;
        }

        public Builder startTime(LocalDateTime startTime) {
            this.startTime = startTime;
            return this;
        }

        public Builder endTime(LocalDateTime endTime) {
            this.endTime = endTime;
            return this;
        }

        public Builder startingPrice(BigDecimal startingPrice) {
            this.startingPrice = startingPrice;
            return this;
        }

        public Builder incrementAmount(BigDecimal incrementAmount) {
            this.incrementAmount = incrementAmount;
            return this;
        }

        public Builder currentBid(BigDecimal currentBid) {
            this.currentBid = currentBid;
            return this;
        }

        public Builder requiresDeposit(Boolean requiresDeposit) {
            this.requiresDeposit = requiresDeposit;
            return this;
        }

        public Builder securityDeposit(BigDecimal securityDeposit) {
            this.securityDeposit = securityDeposit;
            return this;
        }

        public Builder status(String status) {
            this.status = status;
            return this;
        }

        public Builder bidCount(Integer bidCount) {
            this.bidCount = bidCount;
            return this;
        }

        public Builder winnerId(Long winnerId) {
            this.winnerId = winnerId;
            return this;
        }

        public Builder winnerPaymentDeadline(LocalDateTime winnerPaymentDeadline) {
            this.winnerPaymentDeadline = winnerPaymentDeadline;
            return this;
        }

        public Builder disputeRequestDeadline(LocalDateTime disputeRequestDeadline) {
            this.disputeRequestDeadline = disputeRequestDeadline;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            this.createdAt = createdAt;
            return this;
        }

        public Builder updatedAt(LocalDateTime updatedAt) {
            this.updatedAt = updatedAt;
            return this;
        }

        public Builder deletedAt(LocalDateTime deletedAt) {
            this.deletedAt = deletedAt;
            return this;
        }

        public AuctionResponseDTO build() {
            return new AuctionResponseDTO(this);
        }
    }
}