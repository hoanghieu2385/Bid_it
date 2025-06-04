package com.example.user.service;

import com.example.user.model.OtpType;
import com.example.user.repository.UserRepository;
import com.twilio.Twilio;
import com.twilio.rest.verify.v2.service.Verification;
import com.twilio.rest.verify.v2.service.VerificationCheck;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class OtpService {

    private final EmailService emailService;
    private final SmsService smsService;
    private final UserRepository userRepository;

    @Value("${otp.expiration.minutes}")
    private int otpExpirationMinutes;

    @Value("${twilio.verify.sid}")
    private String twilioVerifySid;

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    public OtpService(EmailService emailService,
                      SmsService smsService,
                      UserRepository userRepository) {
        this.emailService = emailService;
        this.smsService = smsService;
        this.userRepository = userRepository;
    }

    // Gửi OTP xác minh số điện thoại qua Twilio Verify API
    public void sendPhoneVerificationOtp(String phoneNumber) {
        try {
            Twilio.init(accountSid, authToken);
            Verification verification = Verification.creator(twilioVerifySid, phoneNumber, "sms").create();
            System.out.println("Send OTP status: " + verification.getStatus());
        } catch (Exception e) {
            System.out.println("Error sending OTP with Twilio: " + e.getMessage());
        }
    }

    // Xác minh OTP cho số điện thoại
    public boolean verifyOtp(String contact, String otp, OtpType type) {
        if (type == OtpType.PHONE_VERIFICATION) {
            try {
                Twilio.init(accountSid, authToken);

                VerificationCheck verification = VerificationCheck.creator(twilioVerifySid, otp)
                        .setTo(contact)
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
                return false;
            }
            return false;
        }

        return false;
    }
}
