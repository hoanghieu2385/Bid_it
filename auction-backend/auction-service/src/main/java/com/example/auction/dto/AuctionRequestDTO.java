package com.example.auction.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
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
}
