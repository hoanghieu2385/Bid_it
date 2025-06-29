package com.example.user.controller;

import com.example.user.Dtos.AuctionWinEmailRequest;
import com.example.user.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Internal API controller cho các service khác gọi
 * Mục đích: Gửi email thông báo người thắng đấu giá
 */
@RestController
@RequestMapping("/api/internal/email")
public class InternalEmailController {

    private final EmailService emailService;

    public InternalEmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/auction-winner")
    public ResponseEntity<String> sendAuctionWinnerEmail(@RequestBody AuctionWinEmailRequest request) {
        System.out.println("👉 Nhận request gửi email cho winner: " + request.getEmail());
        try {
            emailService.sendAuctionWinEmail(
                    request.getEmail(),
                    request.getAuctionTitle(),
                    request.getAuctionIdOrSlug(),
                    request.getImageUrl(),
                    request.getFinalPrice()
            );
            return ResponseEntity.ok("✅ Email sent successfully");
        } catch (Exception e) {
            return ResponseEntity.internalServerError()
                    .body("❌ Failed to send email: " + e.getMessage());
        }
    }
}
