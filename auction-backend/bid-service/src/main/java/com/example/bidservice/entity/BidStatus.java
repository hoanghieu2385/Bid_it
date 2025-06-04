package com.example.bidservice.entity;

public enum BidStatus {
    ACTIVE,      // Bid đang hoạt động, chưa bị outbid
    OUTBID,      // Bid đã bị người khác bid cao hơn
    WINNING,     // Bid hiện tại đang thắng (highest bid)
    FAILED,      // Bid thất bại (lỗi hệ thống, thanh toán, etc.)
    CANCELLED    // Bid bị hủy (do user hoặc admin)
}