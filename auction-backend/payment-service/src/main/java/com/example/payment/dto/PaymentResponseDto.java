package com.example.payment.dto;

import com.example.payment.enums.PaymentMethod;
import com.example.payment.enums.PaymentStatus;
import com.example.payment.enums.PaymentType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentResponseDto {

    private Long id;
    private Long userId;
    private Long auctionId;
    private BigDecimal amount;
    private PaymentType paymentType;
    private PaymentMethod paymentMethod;
    private PaymentStatus status;
    private String externalTransactionId;
    private String externalOrderId;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime completedAt;

    // PayPal specific fields
    private String approvalUrl;  // URL để user approve payment trên PayPal
    private String payerId;      // PayPal payer ID
}