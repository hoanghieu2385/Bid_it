package com.example.auction.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
public class AuctionRequestDTO {

//  For capturing data when creating or updating an auction

    @NotBlank(message = "Title is required")
    private String title;

    private String description;

    @NotNull(message = "Seller ID is required")
    private Long sellerId;

    @NotNull(message = "Category ID is required")
    private Long categoryId;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    private LocalDateTime endTime;

    @NotNull(message = "Starting price is required")
    private BigDecimal startingPrice;

    @NotNull(message = "Increment amount is required")
    private BigDecimal incrementAmount;

    // Optional
    private BigDecimal currentBid;

    private Boolean requiresDeposit = false;
    private BigDecimal securityDeposit;

    // Accept status as a string (to be converted to AuctionStatus)
    private String status;

    // Optional
    private Integer bidCount;
}
