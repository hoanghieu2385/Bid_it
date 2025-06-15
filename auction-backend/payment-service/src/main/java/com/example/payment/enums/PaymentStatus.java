package com.example.payment.enums;

public enum PaymentStatus {
    PENDING,        // Đang chờ thanh toán
    PROCESSING,     // Đang xử lý
    COMPLETED,      // Hoàn thành
    FAILED,         // Thất bại
    CANCELLED,      // Hủy bỏ
    REFUNDED        // Hoàn tiền
}