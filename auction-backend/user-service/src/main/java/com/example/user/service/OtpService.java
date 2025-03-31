package com.example.user.service;

import com.example.user.model.Otp;
import com.example.user.model.OtpType;
import com.example.user.repository.OtpRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
@RequiredArgsConstructor
public class OtpService {
    private final OtpRepository otpRepository;
    private final EmailService emailService;

    @Value("${otp.expiration.minutes}")
    private int otpExpirationMinutes;

    public String generateOtp() {
        Random random = new Random();
        int number = 100000 + random.nextInt(900000);
        return String.valueOf(number);
    }

    public void sendVerificationOtp(String email) {
        String otp = generateOtp();
        LocalDateTime expiryDate = LocalDateTime.now().plusMinutes(otpExpirationMinutes);

        Otp otpEntity = Otp.builder()
                .email(email)
                .code(otp)
                .expiryDate(expiryDate)
                .used(false)
                .type(OtpType.EMAIL_VERIFICATION)
                .build();

        otpRepository.save(otpEntity);
        emailService.sendVerificationEmail(email, otp);
    }

    public void sendLoginOtp(String email) {
        String otp = generateOtp();
        LocalDateTime expiryDate = LocalDateTime.now().plusMinutes(otpExpirationMinutes);

        Otp otpEntity = Otp.builder()
                .email(email)
                .code(otp)
                .expiryDate(expiryDate)
                .used(false)
                .type(OtpType.LOGIN)
                .build();

        otpRepository.save(otpEntity);
        emailService.sendLoginOtp(email, otp);
    }

    public boolean verifyOtp(String email, String otp, OtpType type) {
        Otp otpEntity = otpRepository.findByEmailAndCodeAndTypeAndUsedFalse(email, otp, type)
                .orElse(null);

        if (otpEntity == null) {
            return false;
        }

        if (LocalDateTime.now().isAfter(otpEntity.getExpiryDate())) {
            return false;
        }

        otpEntity.setUsed(true);
        otpRepository.save(otpEntity);
        return true;
    }
}