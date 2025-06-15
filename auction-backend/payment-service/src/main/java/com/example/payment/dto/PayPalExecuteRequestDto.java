package com.example.payment.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * DTO để execute PayPal payment sau khi user approve
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PayPalExecuteRequestDto {

    @NotBlank(message = "Payment ID is required")
    private String paymentId;

    @NotBlank(message = "Payer ID is required")
    private String payerId;
}