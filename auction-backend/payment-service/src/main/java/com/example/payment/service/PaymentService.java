package com.example.payment.service;

import com.example.payment.client.AuctionServiceClient;
import com.example.payment.client.UserServiceClient;
import com.example.payment.dto.*;
import com.example.payment.entity.Payment;
import com.example.payment.enums.AuctionStatus;
import com.example.payment.enums.PaymentMethod;
import com.example.payment.enums.PaymentStatus;
import com.example.payment.enums.PaymentType;
import com.example.payment.repository.PaymentRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService implements IPaymentService {

    private final PaymentRepository paymentRepository;
    private final IPayPalService payPalService;
    private final AuctionServiceClient auctionServiceClient;
    private final UserServiceClient userServiceClient;

    @Override
    @Transactional
    public PaymentResponseDto createPayment(PaymentRequestDto request) {
        log.info("Creating payment for user: {}, auction: {}, amount: {}",
                request.getUserId(), request.getAuctionId(), request.getAmount());

        // Validate business rules
        validatePaymentRequest(request);

        // Tạo payment entity
        Payment payment = new Payment();
        payment.setUserId(request.getUserId());
        payment.setAuctionId(request.getAuctionId());
        payment.setAmount(request.getAmount());
        payment.setPaymentType(request.getPaymentType());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setStatus(PaymentStatus.PENDING);
        payment.setDescription(request.getDescription());

        // Lưu payment trước
        payment = paymentRepository.save(payment);

        // Xử lý theo payment method
        String approvalUrl = null;
        if (request.getPaymentMethod() == PaymentMethod.PAYPAL) {
            try {
                // Tạo PayPal order
                String orderId = payPalService.createPayPalOrder(
                        request.getAmount(),
                        "USD",
                        request.getReturnUrl(),
                        request.getCancelUrl(),
                        request.getDescription()
                );

                payment.setExternalOrderId(orderId);
                approvalUrl = payPalService.getApprovalUrl(orderId);

                // Cập nhật payment
                payment = paymentRepository.save(payment);

                log.info("PayPal order created successfully: {}", orderId);
            } catch (Exception e) {
                log.error("Failed to create PayPal order: {}", e.getMessage());
                payment.setStatus(PaymentStatus.FAILED);
                paymentRepository.save(payment);
                throw new RuntimeException("Failed to create PayPal payment: " + e.getMessage());
            }
        }

        return convertToResponseDto(payment, approvalUrl);
    }

    @Override
    @Transactional
    public PaymentResponseDto createAuctionPayment(AuctionPaymentRequestDto request) {
        log.info("Creating auction payment for winner: {}, auction: {}, final amount: {}",
                request.getWinnerId(), request.getAuctionId(), request.getFinalAmount());

        // Validate auction and winner
        validateAuctionPayment(request);

        // Tính toán số tiền thực tế cần thanh toán (trừ deposit nếu có)
        BigDecimal actualAmount = request.getFinalAmount().subtract(request.getDepositAmount());

        if (actualAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Actual payment amount must be greater than 0");
        }

        // Tạo PaymentRequestDto
        PaymentRequestDto paymentRequest = new PaymentRequestDto();
        paymentRequest.setUserId(request.getWinnerId());
        paymentRequest.setAuctionId(request.getAuctionId());
        paymentRequest.setAmount(actualAmount);
        paymentRequest.setPaymentType(PaymentType.AUCTION_PAYMENT);
        paymentRequest.setPaymentMethod(request.getPaymentMethod());
        paymentRequest.setDescription("Auction payment for auction ID: " + request.getAuctionId());
        paymentRequest.setReturnUrl(request.getReturnUrl());
        paymentRequest.setCancelUrl(request.getCancelUrl());

        return createPayment(paymentRequest);
    }

    @Override
    @Transactional
    public PaymentStatusDto executePayPalPayment(PayPalExecuteRequestDto request) {
        log.info("Executing PayPal payment: {}, payer: {}", request.getPaymentId(), request.getPayerId());

        // Tìm payment theo external order ID
        Payment payment = paymentRepository.findByExternalOrderId(request.getPaymentId())
                .orElseThrow(() -> new RuntimeException("Payment not found with order ID: " + request.getPaymentId()));

        // Validate payment status
        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new RuntimeException("Payment is not in pending status");
        }

        try {
            // Execute PayPal payment
            String transactionId = payPalService.executePayPalPayment(request.getPaymentId(), request.getPayerId());

            // Cập nhật payment
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setExternalTransactionId(transactionId);
            payment.setCompletedAt(LocalDateTime.now());
            paymentRepository.save(payment);

            log.info("PayPal payment executed successfully. Transaction ID: {}", transactionId);

            // Gọi auction-service để xác nhận đấu giá đã được thanh toán
            try {
                auctionServiceClient.confirmPayment(payment.getAuctionId(), String.valueOf(payment.getId()));
                log.info("Notified auction-service about successful payment for auction {}", payment.getAuctionId());
            } catch (Exception ex) {
                log.warn("Failed to notify auction-service about payment: {}", ex.getMessage());
            }

            return PaymentStatusDto.success(payment.getId(), transactionId);

        } catch (Exception e) {
            log.error("Failed to execute PayPal payment: {}", e.getMessage());
            payment.setStatus(PaymentStatus.FAILED);
            paymentRepository.save(payment);
            return PaymentStatusDto.failed(payment.getId(), e.getMessage());
        }
    }

    // Validation methods
    private void validatePaymentRequest(PaymentRequestDto request) {
        // Validate user exists
        try {
            UserDto user = userServiceClient.getUserById(request.getUserId());
            if (user == null) {
                throw new RuntimeException("User not found with ID: " + request.getUserId());
            }
        } catch (Exception e) {
            log.error("Error validating user: {}", e.getMessage());
            throw new RuntimeException("Invalid user ID: " + request.getUserId());
        }

        // Validate auction exists
        try {
            AuctionDto auction = auctionServiceClient.getAuctionById(request.getAuctionId());
            if (auction == null) {
                throw new RuntimeException("Auction not found with ID: " + request.getAuctionId());
            }
        } catch (Exception e) {
            log.error("Error validating auction: {}", e.getMessage());
            throw new RuntimeException("Invalid auction ID: " + request.getAuctionId());
        }
    }

    private void validateAuctionPayment(AuctionPaymentRequestDto request) {
        // Get auction details
        AuctionDto auction;
        try {
            auction = auctionServiceClient.getAuctionById(request.getAuctionId());
        } catch (Exception e) {
            log.error("Error getting auction details: {}", e.getMessage());
            throw new RuntimeException("Failed to get auction details");
        }

        // Validate auction status
        if (auction.getStatus() != AuctionStatus.SOLD) {
            throw new RuntimeException("Auction is not in SOLD status. Current status: " + auction.getStatus());
        }

        // Validate winner
        if (!Objects.equals(auction.getWinnerId(), request.getWinnerId())) {
            throw new RuntimeException("User is not the winner of this auction");
        }

        // Validate payment deadline
        if (auction.getWinnerPaymentDeadline() != null &&
                LocalDateTime.now().isAfter(auction.getWinnerPaymentDeadline())) {
            throw new RuntimeException("Payment deadline has passed");
        }

        // Validate final amount matches current bid
        if (request.getFinalAmount().compareTo(auction.getCurrentBid()) != 0) {
            throw new RuntimeException("Final amount does not match auction current bid");
        }

        // Check if already paid
        if (isAuctionPaid(request.getAuctionId())) {
            throw new RuntimeException("Auction has already been paid");
        }

        // Validate user exists
        try {
            UserDto user = userServiceClient.getUserById(request.getWinnerId());
            if (user == null) {
                throw new RuntimeException("Winner not found");
            }
        } catch (Exception e) {
            log.error("Error validating winner: {}", e.getMessage());
            throw new RuntimeException("Invalid winner ID");
        }
    }

    // Remaining methods stay the same...
    @Override
    public PaymentResponseDto getPaymentById(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with ID: " + paymentId));
        return convertToResponseDto(payment, null);
    }

    @Override
    public PaymentResponseDto getPaymentByOrderId(String orderId) {
        Payment payment = paymentRepository.findByExternalOrderId(orderId)
                .orElseThrow(() -> new RuntimeException("Payment not found with order ID: " + orderId));
        return convertToResponseDto(payment, null);
    }

    @Override
    public List<PaymentResponseDto> getPaymentsByUserId(Long userId) {
        List<Payment> payments = paymentRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return payments.stream()
                .map(payment -> convertToResponseDto(payment, null))
                .collect(Collectors.toList());
    }

    @Override
    public List<PaymentResponseDto> getPaymentsByAuctionId(Long auctionId) {
        List<Payment> payments = paymentRepository.findByAuctionIdOrderByCreatedAtDesc(auctionId);
        return payments.stream()
                .map(payment -> convertToResponseDto(payment, null))
                .collect(Collectors.toList());
    }

    @Override
    @Transactional
    public PaymentStatusDto updatePaymentStatus(Long paymentId, PaymentStatus status) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with ID: " + paymentId));

        payment.setStatus(status);
        if (status == PaymentStatus.COMPLETED) {
            payment.setCompletedAt(LocalDateTime.now());
        }
        paymentRepository.save(payment);

        return new PaymentStatusDto(paymentId, status, "Status updated successfully", LocalDateTime.now(), payment.getExternalTransactionId());
    }

    @Override
    public boolean isAuctionPaid(Long auctionId) {
        return paymentRepository.findCompletedAuctionPayment(auctionId).isPresent();
    }

    @Override
    public boolean hasUserPaidDeposit(Long userId, Long auctionId) {
        return paymentRepository.hasUserPaidDepositForAuction(userId, auctionId);
    }

    @Override
    @Transactional
    public PaymentStatusDto cancelPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new RuntimeException("Payment not found with ID: " + paymentId));

        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            throw new RuntimeException("Cannot cancel completed payment");
        }

        payment.setStatus(PaymentStatus.CANCELLED);
        paymentRepository.save(payment);

        return new PaymentStatusDto(paymentId, PaymentStatus.CANCELLED, "Payment cancelled successfully", LocalDateTime.now(), null);
    }

    @Override
    public void handlePayPalWebhook(String payload) {
        // TODO: Implement PayPal webhook handling nếu cần
        log.info("Received PayPal webhook: {}", payload);
    }

    // Helper method để convert Entity sang Dto
    private PaymentResponseDto convertToResponseDto(Payment payment, String approvalUrl) {
        PaymentResponseDto dto = new PaymentResponseDto();
        dto.setId(payment.getId());
        dto.setUserId(payment.getUserId());
        dto.setAuctionId(payment.getAuctionId());
        dto.setAmount(payment.getAmount());
        dto.setPaymentType(payment.getPaymentType());
        dto.setPaymentMethod(payment.getPaymentMethod());
        dto.setStatus(payment.getStatus());
        dto.setExternalTransactionId(payment.getExternalTransactionId());
        dto.setExternalOrderId(payment.getExternalOrderId());
        dto.setDescription(payment.getDescription());
        dto.setCreatedAt(payment.getCreatedAt());
        dto.setUpdatedAt(payment.getUpdatedAt());
        dto.setCompletedAt(payment.getCompletedAt());
        dto.setApprovalUrl(approvalUrl);
        return dto;
    }
}
