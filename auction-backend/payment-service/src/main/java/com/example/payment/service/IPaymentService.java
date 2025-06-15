package com.example.payment.service;

import com.example.payment.dto.*;
import com.example.payment.enums.PaymentStatus;

import java.util.List;

public interface IPaymentService {

    // Tạo payment request (tổng quát)
    PaymentResponseDto createPayment(PaymentRequestDto request);

    // Tạo auction payment cho winner (ưu tiên làm trước)
    PaymentResponseDto createAuctionPayment(AuctionPaymentRequestDto request);

    // Execute PayPal payment sau khi user approve
    PaymentStatusDto executePayPalPayment(PayPalExecuteRequestDto request);

    // Lấy thông tin payment theo ID
    PaymentResponseDto getPaymentById(Long paymentId);

    // Lấy payment theo external order ID (PayPal)
    PaymentResponseDto getPaymentByOrderId(String ordererId);

    // Lấy tất cả payment của user
    List<PaymentResponseDto> getPaymentsByUserId(Long userId);

    // Lấy tất cả payment của auction
    List<PaymentResponseDto> getPaymentsByAuctionId(Long auctionId);

    // Cập nhật status payment
    PaymentStatusDto updatePaymentStatus(Long paymentId, PaymentStatus status);

    // Kiểm tra auction đã được thanh toán chưa
    boolean isAuctionPaid(Long auctionId);

    // Kiểm tra user đã thanh toán deposit cho auction chưa (dự phòng)
    boolean hasUserPaidDeposit(Long userId, Long auctionId);

    // Hủy payment (set status = CANCELLED)
    PaymentStatusDto cancelPayment(Long paymentId);

    // Webhook handler cho PayPal notifications (nếu cần)
    void handlePayPalWebhook(String payload);
}