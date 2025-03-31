package com.example.auction.dto;

import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@Builder
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
}
