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
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;
import java.util.Optional;
import java.util.UUID;
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

        // Generate idempotency key if not provided
        String idempotencyKey = StringUtils.hasText(request.getIdempotencyKey())
                ? request.getIdempotencyKey()
                : generateIdempotencyKey(request);

        // Check for existing payment with same idempotency key
        Optional<Payment> existingPayment = paymentRepository.findByIdempotencyKey(idempotencyKey);
        if (existingPayment.isPresent()) {
            log.info("Payment with idempotency key {} already exists, returning existing payment", idempotencyKey);
            Payment payment = existingPayment.get();

            // Handle existing PayPal payment
            if (payment.getStatus() == PaymentStatus.PENDING &&
                    payment.getPaymentMethod() == PaymentMethod.PAYPAL) {
                return handleExistingPayPalPayment(payment, request);
            }

            return convertToResponseDto(payment, null);
        }

        // Check for active payment (same user, auction, type)
        Optional<Payment> activePayment = paymentRepository.findActivePaymentByUserAuctionType(
                request.getUserId(), request.getAuctionId(), request.getPaymentType());

        if (activePayment.isPresent()) {
            Payment payment = activePayment.get();
            log.info("Active payment already exists for user: {}, auction: {}, type: {}",
                    request.getUserId(), request.getAuctionId(), request.getPaymentType());

            // Handle existing PayPal payment
            if (payment.getStatus() == PaymentStatus.PENDING &&
                    payment.getPaymentMethod() == PaymentMethod.PAYPAL) {
                return handleExistingPayPalPayment(payment, request);
            }

            return convertToResponseDto(payment, null);
        }

        // Validate business rules
        validatePaymentRequest(request);

        // Create new payment
        return createNewPayment(request, idempotencyKey);
    }

    /**
     * Handle existing PayPal payment - recreate order if needed
     */
    private PaymentResponseDto handleExistingPayPalPayment(Payment payment, PaymentRequestDto request) {
        String approvalUrl = null;
        boolean needNewOrder = false;

        if (StringUtils.hasText(payment.getExternalOrderId())) {
            // Check if existing order is still valid
            if (payPalService.isOrderValid(payment.getExternalOrderId())) {
                try {
                    // Get approval URL for valid existing order
                    approvalUrl = payPalService.getApprovalUrl(payment.getExternalOrderId());
                    log.info("Successfully retrieved approval URL for existing valid order: {}", payment.getExternalOrderId());
                } catch (Exception e) {
                    log.warn("Failed to get approval URL for valid order {}: {}",
                            payment.getExternalOrderId(), e.getMessage());
                    needNewOrder = true;
                }
            } else {
                log.info("Existing PayPal order {} is expired/invalid, creating new order", payment.getExternalOrderId());
                needNewOrder = true;
            }
        } else {
            // No external order ID, need to create new one
            needNewOrder = true;
        }

        if (needNewOrder) {
            try {
                log.info("Creating new PayPal order for existing payment: {}", payment.getId());
                String newOrderId = payPalService.createPayPalOrder(
                        payment.getAmount(),
                        "USD",
                        request.getReturnUrl(),
                        request.getCancelUrl(),
                        payment.getDescription()
                );

                // Update payment with new order ID
                payment.setExternalOrderId(newOrderId);
                payment.setUpdatedAt(LocalDateTime.now());
                payment = paymentRepository.save(payment);

                // Get approval URL for new order
                approvalUrl = payPalService.getApprovalUrl(newOrderId);
                log.info("New PayPal order created successfully: {}", newOrderId);

            } catch (Exception createException) {
                log.error("Failed to create new PayPal order: {}", createException.getMessage());
                throw new RuntimeException("Failed to recreate PayPal payment: " + createException.getMessage());
            }
        }

        return convertToResponseDto(payment, approvalUrl);
    }

    /**
     * Create completely new payment
     */
    private PaymentResponseDto createNewPayment(PaymentRequestDto request, String idempotencyKey) {
        // Create payment entity
        Payment payment = Payment.builder()
                .userId(request.getUserId())
                .auctionId(request.getAuctionId())
                .amount(request.getAmount())
                .paymentType(request.getPaymentType())
                .paymentMethod(request.getPaymentMethod())
                .status(PaymentStatus.PENDING)
                .description(request.getDescription())
                .idempotencyKey(idempotencyKey)
                .build();

        try {
            // Save payment first
            payment = paymentRepository.save(payment);
            log.info("Payment saved with ID: {}", payment.getId());

            // Process according to payment method
            String approvalUrl = null;
            if (request.getPaymentMethod() == PaymentMethod.PAYPAL) {
                try {
                    // Create PayPal order
                    String orderId = payPalService.createPayPalOrder(
                            request.getAmount(),
                            "USD",
                            request.getReturnUrl(),
                            request.getCancelUrl(),
                            request.getDescription()
                    );

                    payment.setExternalOrderId(orderId);
                    approvalUrl = payPalService.getApprovalUrl(orderId);

                    // Update payment
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

        } catch (DataIntegrityViolationException e) {
            log.warn("Duplicate payment detected by database constraint: {}", e.getMessage());

            // Try to find the existing payment that caused the constraint violation
            Optional<Payment> duplicatePayment = paymentRepository.findActivePaymentByUserAuctionType(
                    request.getUserId(), request.getAuctionId(), request.getPaymentType());

            if (duplicatePayment.isPresent()) {
                log.info("Returning existing payment due to constraint violation");

                // Handle PayPal payment if needed
                if (duplicatePayment.get().getStatus() == PaymentStatus.PENDING &&
                        duplicatePayment.get().getPaymentMethod() == PaymentMethod.PAYPAL) {
                    return handleExistingPayPalPayment(duplicatePayment.get(), request);
                }

                return convertToResponseDto(duplicatePayment.get(), null);
            }

            throw new RuntimeException("Payment creation failed due to duplicate constraint");
        }
    }

    @Override
    @Transactional
    public PaymentResponseDto createAuctionPayment(AuctionPaymentRequestDto request) {
        log.info("Creating auction payment for winner: {}, auction: {}, final amount: {}",
                request.getWinnerId(), request.getAuctionId(), request.getFinalAmount());

        // Check if auction payment already exists
        if (isAuctionPaid(request.getAuctionId())) {
            log.info("Auction {} already has a completed payment", request.getAuctionId());

            // Return existing payment
            Optional<Payment> existingPayment = paymentRepository.findCompletedAuctionPayment(request.getAuctionId());
            if (existingPayment.isPresent()) {
                if (!Objects.equals(existingPayment.get().getUserId(), request.getWinnerId())) {
                    throw new RuntimeException("Auction has been paid by a different user");
                }
                return convertToResponseDto(existingPayment.get(), null);
            }
        }

        // Validate auction and winner
        validateAuctionPayment(request);

        // Calculate actual amount to pay (subtract deposit if any)
        BigDecimal actualAmount = request.getFinalAmount().subtract(request.getDepositAmount());

        if (actualAmount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new RuntimeException("Actual payment amount must be greater than 0");
        }

        // Generate idempotency key for auction payment
        String idempotencyKey = generateAuctionPaymentIdempotencyKey(request);

        // Create PaymentRequestDto
        PaymentRequestDto paymentRequest = new PaymentRequestDto();
        paymentRequest.setUserId(request.getWinnerId());
        paymentRequest.setAuctionId(request.getAuctionId());
        paymentRequest.setAmount(actualAmount);
        paymentRequest.setPaymentType(PaymentType.AUCTION_PAYMENT);
        paymentRequest.setPaymentMethod(request.getPaymentMethod());
        paymentRequest.setDescription("Auction payment for auction ID: " + request.getAuctionId());
        paymentRequest.setReturnUrl(request.getReturnUrl());
        paymentRequest.setCancelUrl(request.getCancelUrl());
        paymentRequest.setIdempotencyKey(idempotencyKey);

        return createPayment(paymentRequest);
    }

    @Override
    @Transactional
    public PaymentStatusDto executePayPalPayment(PayPalExecuteRequestDto request) {
        log.info("Executing PayPal payment: {}, payer: {}", request.getPaymentId(), request.getPayerId());

        // Find payment by external order ID
        Payment payment = paymentRepository.findByExternalOrderId(request.getPaymentId())
                .orElseThrow(() -> new RuntimeException("Payment not found with order ID: " + request.getPaymentId()));

        // Validate payment status
        if (payment.getStatus() == PaymentStatus.COMPLETED) {
            log.info("Payment {} is already completed, returning existing status", payment.getId());
            return PaymentStatusDto.success(payment.getId(), payment.getExternalTransactionId());
        }

        if (payment.getStatus() != PaymentStatus.PENDING) {
            throw new RuntimeException("Payment is not in pending status. Current status: " + payment.getStatus());
        }

        try {
            // Execute PayPal payment
            String transactionId = payPalService.executePayPalPayment(request.getPaymentId(), request.getPayerId());

            // Update payment
            payment.setStatus(PaymentStatus.COMPLETED);
            payment.setExternalTransactionId(transactionId);
            payment.setCompletedAt(LocalDateTime.now());
            paymentRepository.save(payment);

            log.info("PayPal payment executed successfully. Transaction ID: {}", transactionId);

            // Confirm payment with auction-service (will automatically update status to SOLD)
            try {
                auctionServiceClient.confirmPayment(payment.getAuctionId(), String.valueOf(payment.getId()));
                log.info("Successfully confirmed payment for auction {} - status updated to SOLD", payment.getAuctionId());
            } catch (Exception ex) {
                log.warn("Failed to confirm payment with auction-service: {}", ex.getMessage());
                // Note: Payment is still successful, just the auction status update failed
                // Consider adding retry mechanism or manual intervention alert here
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

        // Validate auction status - only allow payment for CLOSED auctions
        if (auction.getStatus() != AuctionStatus.CLOSED) {
            if (auction.getStatus() == AuctionStatus.SOLD) {
                throw new RuntimeException("Auction has already been paid. Current status: " + auction.getStatus());
            }
            throw new RuntimeException("Auction is not ready for payment. Current status: " + auction.getStatus() + ". Auction must be CLOSED to allow payment.");
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

    // Helper methods for idempotency
    private String generateIdempotencyKey(PaymentRequestDto request) {
        return String.format("payment_%s_%s_%s_%s_%s",
                request.getUserId(),
                request.getAuctionId(),
                request.getPaymentType().name(),
                request.getAmount().toString(),
                UUID.randomUUID().toString().substring(0, 8));
    }

    private String generateAuctionPaymentIdempotencyKey(AuctionPaymentRequestDto request) {
        return String.format("auction_payment_%s_%s_%s",
                request.getWinnerId(),
                request.getAuctionId(),
                request.getFinalAmount().toString());
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
        // TODO: Implement PayPal webhook handling if needed
        log.info("Received PayPal webhook: {}", payload);
    }

    // Helper method to convert Entity to Dto
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