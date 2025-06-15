package com.example.payment.dto;

import com.example.payment.enums.AuctionStatus;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class AuctionDto {
    private Long id;
    private String title;
    private String description;
    private Long sellerId;
    private Long winnerId;
    private BigDecimal currentBid;
    private BigDecimal startingPrice;
    private BigDecimal securityDeposit;
    private Boolean requiresDeposit;
    private AuctionStatus status;
    private LocalDateTime winnerPaymentDeadline;
    private LocalDateTime endTime;
}