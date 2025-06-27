package com.example.user.controller;

import com.example.user.Dtos.AuctionWinEmailRequest;
import com.example.user.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/internal/email")
public class InternalEmailController {

    private final EmailService emailService;

    public InternalEmailController(EmailService emailService) {
        this.emailService = emailService;
    }

    @PostMapping("/auction-winner")
    public ResponseEntity<Void> sendAuctionWinnerEmail(@RequestBody AuctionWinEmailRequest request) {
        System.out.println("👉 Nhận request gửi email cho winner: " + request.getEmail());
        emailService.sendAuctionWinEmail(
                request.getEmail(),
                request.getAuctionTitle(),
                request.getAuctionIdOrSlug(),
                request.getImageUrl(),
                request.getFinalPrice()
        );
        return ResponseEntity.ok().build();
    }
}
