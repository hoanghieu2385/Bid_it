package com.example.user.service;

import com.example.user.model.Otp;
import com.example.user.model.OtpType;
import com.example.user.repository.OtpRepository;
import com.example.user.model.User;
import com.example.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Random;

@Service
public class OtpService {
    private final OtpRepository otpRepository;
    private final EmailService emailService;
    private final SmsService smsService;
    private final UserRepository userRepository;

    @Value("${otp.expiration.minutes}")
    private int otpExpirationMinutes;

    public OtpService(OtpRepository otpRepository, EmailService emailService, SmsService smsService, UserRepository userRepository) {
        this.otpRepository = otpRepository;
        this.emailService = emailService;
        this.smsService = smsService;
        this.userRepository = userRepository;
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

    public boolean verifyOtp(String contact, String otp, OtpType type) {
        Otp otpEntity = otpRepository.findByContactAndCodeAndTypeAndUsedFalse(contact, otp, type)
                .orElse(null);

        if (otpEntity == null || LocalDateTime.now().isAfter(otpEntity.getExpiryDate())) {
            return false;
        }

        otpEntity.setUsed(true);
        otpRepository.save(otpEntity);

        // Nếu là xác minh số điện thoại thì update user.phoneVerified = true
        if (type == OtpType.PHONE_VERIFICATION) {
            userRepository.findByPhoneNumber(contact).ifPresent(user -> {
                user.setPhoneVerified(true);
                userRepository.save(user);
            });
        }

        return true;
    }


    // 📱 PHONE: gửi OTP qua Twilio Verify API
    public void sendPhoneVerificationOtp(String phoneNumber) {
        smsService.sendOtpSms(phoneNumber); // ✅ Không cần sinh OTP nữa
    }
}
