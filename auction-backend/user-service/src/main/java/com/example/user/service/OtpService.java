package com.example.user.service;

import com.example.user.model.OtpType;
import com.example.user.repository.UserRepository;
import com.twilio.rest.verify.v2.service.Verification;
import com.twilio.rest.verify.v2.service.VerificationCheck;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
public class OtpService {

    private final EmailService emailService;
    private final SmsService smsService;
    private final UserRepository userRepository;

    @Value("${otp.expiration.minutes}")
    private int otpExpirationMinutes;

    @Value("${twilio.verify.sid}")
    private String twilioVerifySid;

    public OtpService(
            EmailService emailService,
            SmsService smsService,
            UserRepository userRepository
    ) {
        this.emailService = emailService;
        this.smsService = smsService;
        this.userRepository = userRepository;
    }

    public String generateOtp() {
        Random random = new Random();
        int number = 100000 + random.nextInt(900000);
        return String.valueOf(number);
    }

    // ✅ Gửi OTP xác minh email
    public void sendVerificationOtp(String email) {
        String otp = generateOtp();
        emailService.sendAccountVerificationEmail(email, otp);
        // ❗ Nếu bạn cần lưu OTP email vào DB thì bổ sung vào đây (tùy bạn muốn giữ lại hay không)
    }

    // ✅ Gửi OTP đăng nhập qua email
    public void sendLoginOtp(String email) {
        String otp = generateOtp();
        emailService.sendLoginOtp(email, otp);
    }

    // ✅ Gửi OTP xác minh số điện thoại (Twilio)
    public void sendPhoneVerificationOtp(String phoneNumber) {
        try {
            Verification verification = Verification.creator(twilioVerifySid, phoneNumber, "sms").create();
            System.out.println("Send OTP status: " + verification.getStatus());
        } catch (Exception e) {
            System.out.println("Error sending OTP with Twilio: " + e.getMessage());
        }
    }

    // ✅ Xác minh OTP
    public boolean verifyOtp(String contact, String otp, OtpType type) {
        if (type == OtpType.PHONE_VERIFICATION) {
            try {
                VerificationCheck verification = VerificationCheck.creator(twilioVerifySid)
                        .setTo(contact)
                        .setCode(otp)
                        .create();

                System.out.println("Verify status: " + verification.getStatus());

                if ("approved".equalsIgnoreCase(verification.getStatus())) {
                    userRepository.findByPhoneNumber(contact).ifPresent(user -> {
                        user.setPhoneVerified(true);
                        userRepository.save(user);
                    });
                    return true;
                }
            } catch (Exception e) {
                System.out.println("Error verifying OTP with Twilio: " + e.getMessage());
            }
            return false;
        }

        // Nếu là xác minh qua EMAIL (vẫn dùng DB nếu muốn)
        // Có thể return false luôn nếu bạn không xử lý OTP email bằng DB nữa
        return false;
    }
}
