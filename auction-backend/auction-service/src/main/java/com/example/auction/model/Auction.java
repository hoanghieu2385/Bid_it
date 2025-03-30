package com.example.auction.model;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "auction")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
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
}
