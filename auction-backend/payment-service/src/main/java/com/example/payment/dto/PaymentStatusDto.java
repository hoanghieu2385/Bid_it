package com.example.payment.dto;

import com.example.payment.enums.PaymentStatus;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Dto để trả về trạng thái thanh toán
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
public class PaymentStatusDto {

    private Long paymentId;
    private PaymentStatus status;
    private String message;
    private LocalDateTime updatedAt;
    private String externalTransactionId;

    public static PaymentStatusDto success(Long paymentId, String transactionId) {
        return new PaymentStatusDto(
                paymentId,
                PaymentStatus.COMPLETED,
                "Payment completed successfully",
                LocalDateTime.now(),
                transactionId
        );
    }

    public static PaymentStatusDto failed(Long paymentId, String message) {
        return new PaymentStatusDto(
                paymentId,
                PaymentStatus.FAILED,
                message,
                LocalDateTime.now(),
                null
        );
    }

    public static PaymentStatusDto pending(Long paymentId) {
        return new PaymentStatusDto(
                paymentId,
                PaymentStatus.PENDING,
                "Payment is pending",
                LocalDateTime.now(),
                null
        );
    }
}