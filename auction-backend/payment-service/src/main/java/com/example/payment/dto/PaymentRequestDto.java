package com.example.payment.dto;

import com.example.payment.enums.PaymentMethod;
import com.example.payment.enums.PaymentType;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentRequestDto {
    @NotNull(message = "User ID is required")
    private Long userId;

    @NotNull(message = "Auction ID is required")
    private Long auctionId;

    @NotNull(message = "Amount is required")
    @DecimalMin(value = "0.01", message = "Amount must be greater than 0")
    private BigDecimal amount;

    @NotNull(message = "Payment type is required")
    private PaymentType paymentType;

    @NotNull(message = "Payment method is required")
    private PaymentMethod paymentMethod;

    private String description;

    // URL để PayPal redirect sau khi thanh toán thành công
    private String returnUrl;

    // URL để PayPal redirect khi hủy thanh toán
    private String cancelUrl;
}
