package com.example.payment.dto;

import com.example.payment.enums.PaymentMethod;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * DTO đặc biệt cho thanh toán auction (winner payment)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AuctionPaymentRequestDto {

    @NotNull(message = "Auction ID is required")
    private Long auctionId;

    @NotNull(message = "Winner ID is required")
    private Long winnerId;

    @NotNull(message = "Final amount is required")
    @DecimalMin(value = "0.01", message = "Final amount must be greater than 0")
    private BigDecimal finalAmount;

    // Số tiền deposit đã trả (nếu có) - sẽ trừ vào finalAmount
    private BigDecimal depositAmount = BigDecimal.ZERO;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    // URL redirect
    private String returnUrl;
    private String cancelUrl;
}