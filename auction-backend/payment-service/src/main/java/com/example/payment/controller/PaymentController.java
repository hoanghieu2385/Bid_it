package com.example.payment.controller;

import com.example.payment.dto.*;
import com.example.payment.enums.PaymentStatus;
import com.example.payment.service.IPaymentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payment")
@RequiredArgsConstructor
public class PaymentController {

    private final IPaymentService paymentService;

    // 1. Tạo thanh toán chung (deposit, auction, etc.)
    @PostMapping("/create")
    public ResponseEntity<PaymentResponseDto> createPayment(@RequestBody PaymentRequestDto request) {
        return ResponseEntity.ok(paymentService.createPayment(request));
    }

    // 2. Tạo thanh toán cuối phiên cho winner
    @PostMapping("/auction")
    public ResponseEntity<PaymentResponseDto> createAuctionPayment(@RequestBody AuctionPaymentRequestDto request) {
        return ResponseEntity.ok(paymentService.createAuctionPayment(request));
    }

    // 3. Sau khi approve PayPal, frontend gửi lại payerId để thực thi
    @PostMapping("/execute")
    public ResponseEntity<PaymentStatusDto> executePayment(@RequestBody PayPalExecuteRequestDto request) {
        return ResponseEntity.ok(paymentService.executePayPalPayment(request));
    }

    // 4. Lấy payment theo ID
    @GetMapping("/{id}")
    public ResponseEntity<PaymentResponseDto> getPaymentById(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.getPaymentById(id));
    }

    // 5. Lấy payment theo external PayPal orderId
    @GetMapping("/order/{orderId}")
    public ResponseEntity<PaymentResponseDto> getByOrderId(@PathVariable String orderId) {
        return ResponseEntity.ok(paymentService.getPaymentByOrderId(orderId));
    }

    // 6. Lấy tất cả payment theo user
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<PaymentResponseDto>> getByUserId(@PathVariable Long userId) {
        return ResponseEntity.ok(paymentService.getPaymentsByUserId(userId));
    }

    // 7. Lấy tất cả payment theo auction
    @GetMapping("/auction/{auctionId}")
    public ResponseEntity<List<PaymentResponseDto>> getByAuctionId(@PathVariable Long auctionId) {
        return ResponseEntity.ok(paymentService.getPaymentsByAuctionId(auctionId));
    }

    // 8. Cập nhật trạng thái thủ công (nếu cần)
    @PatchMapping("/{id}/status")
    public ResponseEntity<PaymentStatusDto> updateStatus(
            @PathVariable Long id,
            @RequestParam PaymentStatus status
    ) {
        return ResponseEntity.ok(paymentService.updatePaymentStatus(id, status));
    }

    // 9. Check auction đã được thanh toán chưa (để hiển thị trạng thái FE)
    @GetMapping("/check/auction/{auctionId}")
    public ResponseEntity<Boolean> isAuctionPaid(@PathVariable Long auctionId) {
        return ResponseEntity.ok(paymentService.isAuctionPaid(auctionId));
    }

    // 10. Check user đã thanh toán deposit chưa (mở rộng)
    @GetMapping("/check/deposit")
    public ResponseEntity<Boolean> hasUserPaidDeposit(
            @RequestParam Long userId,
            @RequestParam Long auctionId
    ) {
        return ResponseEntity.ok(paymentService.hasUserPaidDeposit(userId, auctionId));
    }

    // 11. Cancel payment nếu chưa hoàn tất
    @DeleteMapping("/{id}")
    public ResponseEntity<PaymentStatusDto> cancelPayment(@PathVariable Long id) {
        return ResponseEntity.ok(paymentService.cancelPayment(id));
    }

    // 12. PayPal webhook listener (nếu dùng webhook, có thể cần verify signature)
    @PostMapping("/webhook")
    public ResponseEntity<Void> handleWebhook(@RequestBody String payload) {
        paymentService.handlePayPalWebhook(payload);
        return ResponseEntity.ok().build();
    }
}
