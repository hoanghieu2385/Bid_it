package com.example.payment.service;

import java.math.BigDecimal;
import java.util.Map;

public interface IPayPalService {

    // Tạo PayPal payment order
    String createPayPalOrder(BigDecimal amount, String currency, String returnUrl, String cancelUrl, String description);

    // Execute PayPal payment
    String executePayPalPayment(String paymentId, String payerId);

    // Lấy approval URL từ PayPal order
    String getApprovalUrl(String orderId);

    // Verify PayPal payment
    boolean verifyPayPalPayment(String transactionId);

    // Get PayPal access token
    String getAccessToken();

    // Refund PayPal payment (dự phòng cho tương lai)
    String refundPayPalPayment(String transactionId, BigDecimal amount, String currency);

    // New methods for order management
    Map<String, Object> getOrderDetails(String orderId);

    boolean isOrderValid(String orderId);
}