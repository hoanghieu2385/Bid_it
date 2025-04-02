package com.example.user.service;

import com.example.user.model.VerificationToken;
import com.example.user.repository.VerificationTokenRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class VerificationTokenService {
    private final VerificationTokenRepository verificationTokenRepository;
    private final EmailService emailService;

    @Value("${verification.token.expiration.hours:24}")
    private int tokenExpirationHours;

    public String generateVerificationToken() {
        return UUID.randomUUID().toString();
    }

    public void sendVerificationToken(String email) {
        String token = generateVerificationToken();
        LocalDateTime expiryDate = LocalDateTime.now().plusHours(tokenExpirationHours);

        VerificationToken verificationToken = VerificationToken.builder()
                .email(email)
                .token(token)
                .expiryDate(expiryDate)
                .used(false)
                .createdAt(LocalDateTime.now())
                .build();

        verificationTokenRepository.save(verificationToken);
        emailService.sendAccountVerificationEmail(email, token);
    }

    public boolean verifyToken(String email, String token) {
        VerificationToken verificationToken = verificationTokenRepository
                .findByTokenAndEmailAndUsedFalse(token, email)
                .orElse(null);

        if (verificationToken == null) {
            return false;
        }

        if (LocalDateTime.now().isAfter(verificationToken.getExpiryDate())) {
            return false;
        }

        verificationToken.setUsed(true);
        verificationTokenRepository.save(verificationToken);
        return true;
    }
}