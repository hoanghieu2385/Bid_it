package com.example.auction.model;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "auction")
public class Auction {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Basic details
    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    // Store only IDs for seller and category
    @Column(name = "seller_id", nullable = false)
    private Long sellerId;

    @Column(name = "category_id", nullable = false)
    private Long categoryId;

    // Auction timing
    @Column(name = "start_time", nullable = false)
    private LocalDateTime startTime;

    @Column(name = "end_time", nullable = false)
    private LocalDateTime endTime;

    // Pricing
    @Column(name = "starting_price", nullable = false)
    private BigDecimal startingPrice;

    @Column(name = "increment_amount", nullable = false)
    private BigDecimal incrementAmount;

    @Column(name = "current_bid")
    private BigDecimal currentBid;

    // Deposit
    @Column(name = "requires_deposit")
    private Boolean requiresDeposit = false;

    @Column(name = "security_deposit")
    private BigDecimal securityDeposit;

    // Auction status
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuctionStatus status = AuctionStatus.UPCOMING;

    @Column(name = "bid_count")
    private Integer bidCount = 0;

    // Winner info
    @Column(name = "winner_id")
    private Long winnerId;

    // Deadlines
    @Column(name = "winner_payment_deadline")
    private LocalDateTime winnerPaymentDeadline;

    @Column(name = "dispute_request_deadline")
    private LocalDateTime disputeRequestDeadline;

    // Timestamps
    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    // Optional soft-delete
    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    // Private constructor for Builder
    private Auction(Builder builder) {
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

    public Auction() {

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

    public AuctionStatus getStatus() {
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

    // Setters
    public void setId(Long id) {
        this.id = id;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public void setSellerId(Long sellerId) {
        this.sellerId = sellerId;
    }

    public void setCategoryId(Long categoryId) {
        this.categoryId = categoryId;
    }

    public void setStartTime(LocalDateTime startTime) {
        this.startTime = startTime;
    }

    public void setEndTime(LocalDateTime endTime) {
        this.endTime = endTime;
    }

    public void setStartingPrice(BigDecimal startingPrice) {
        this.startingPrice = startingPrice;
    }

    public void setIncrementAmount(BigDecimal incrementAmount) {
        this.incrementAmount = incrementAmount;
    }

    public void setCurrentBid(BigDecimal currentBid) {
        this.currentBid = currentBid;
    }

    public void setRequiresDeposit(Boolean requiresDeposit) {
        this.requiresDeposit = requiresDeposit;
    }

    public void setSecurityDeposit(BigDecimal securityDeposit) {
        this.securityDeposit = securityDeposit;
    }

    public void setStatus(AuctionStatus status) {
        this.status = status;
    }

    public void setBidCount(Integer bidCount) {
        this.bidCount = bidCount;
    }

    public void setWinnerId(Long winnerId) {
        this.winnerId = winnerId;
    }

    public void setWinnerPaymentDeadline(LocalDateTime winnerPaymentDeadline) {
        this.winnerPaymentDeadline = winnerPaymentDeadline;
    }

    public void setDisputeRequestDeadline(LocalDateTime disputeRequestDeadline) {
        this.disputeRequestDeadline = disputeRequestDeadline;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public void setDeletedAt(LocalDateTime deletedAt) {
        this.deletedAt = deletedAt;
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
        private AuctionStatus status;
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

        public Builder status(AuctionStatus status) {
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

        public Auction build() {
            return new Auction(this);
        }

        }
    }
