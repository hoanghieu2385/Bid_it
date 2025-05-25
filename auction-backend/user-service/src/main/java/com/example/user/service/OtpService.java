package com.example.user.service;

import com.example.user.model.Otp;
import com.example.user.model.OtpType;
import com.example.user.repository.OtpRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class OtpService {
    private final OtpRepository otpRepository;
    private final EmailService emailService;
    private final SmsService smsService;

    @Value("${otp.expiration.minutes}")
    private int otpExpirationMinutes;

    public OtpService(OtpRepository otpRepository, EmailService emailService, SmsService smsService) {
        this.otpRepository = otpRepository;
        this.emailService = emailService;
        this.smsService = smsService;
    }

    public String generateOtp() {
        Random random = new Random();
        int number = 100000 + random.nextInt(900000);
        return String.valueOf(number);
    }

    // 📧 EMAIL VERIFICATION
    public void sendVerificationOtp(String email) {
        String otp = generateOtp();
        LocalDateTime expiryDate = LocalDateTime.now().plusMinutes(otpExpirationMinutes);

        Otp otpEntity = Otp.builder()
                .contact(email)
                .code(otp)
                .expiryDate(expiryDate)
                .used(false)
                .type(OtpType.EMAIL_VERIFICATION)
                .build();

        otpRepository.save(otpEntity);
        emailService.sendAccountVerificationEmail(email, otp);
    }

    // 📧 LOGIN OTP (EMAIL)
    public void sendLoginOtp(String email) {
        String otp = generateOtp();
        LocalDateTime expiryDate = LocalDateTime.now().plusMinutes(otpExpirationMinutes);

        Otp otpEntity = Otp.builder()
                .contact(email)
                .code(otp)
                .expiryDate(expiryDate)
                .used(false)
                .type(OtpType.LOGIN)
                .build();

        otpRepository.save(otpEntity);
        emailService.sendLoginOtp(email, otp);
    }

    // ✅ VERIFY OTP (EMAIL/LOGIN từ DB)
    public boolean verifyOtp(String contact, String otp, OtpType type) {
        // Nếu là PHONE_VERIFICATION thì dùng Verify API, không dùng DB
        if (type == OtpType.PHONE_VERIFICATION) {
            return smsService.checkOtp(contact, otp); // 📱 Verify qua Twilio
        }

        // EMAIL hoặc LOGIN dùng DB
        Otp otpEntity = otpRepository.findByContactAndCodeAndTypeAndUsedFalse(contact, otp, type)
                .orElse(null);

        if (otpEntity == null || LocalDateTime.now().isAfter(otpEntity.getExpiryDate())) {
            return false;
        }

        otpEntity.setUsed(true);
        otpRepository.save(otpEntity);
        return true;
    }

    // 📱 PHONE: gửi OTP qua Twilio Verify API
    public void sendPhoneVerificationOtp(String phoneNumber) {
        smsService.sendOtpSms(phoneNumber); // ✅ Không cần sinh OTP nữa
    }
}
