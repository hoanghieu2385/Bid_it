package com.example.user.model;

public enum CitizenIdStatus {
    NONE,       // Chưa từng gửi yêu cầu
    PENDING,    // Đã gửi, đang chờ admin duyệt
    APPROVED,   // Đã được duyệt
    DENIED      // Đã bị từ chối
}
