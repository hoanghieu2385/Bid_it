package com.example.auction.model;

public enum AuctionStatus {
    UPCOMING,          // Chưa bắt đầu
    OPENED,            // Đang mở đấu giá
    CANCELLED,         // Bị hủy
    CLOSED,            // Đã đóng nhưng chưa thanh toán
    SOLD,              // Đã thanh toán
    EXPIRED_PAYMENT,   // Người thắng không thanh toán đúng hạn
    FAILED,            // Không ai đấu giá
    SHIPPING,          // Đang giao hàng
    DELIVERED,         // Đã giao hàng
    DISPUTED,          // Có tranh chấp
    PENDING_RETURN,    // Chờ xử lý hoàn hàng
    RETURNING,         // Đang hoàn hàng
    COMPLETED          // Hoàn thành giao dịch
}