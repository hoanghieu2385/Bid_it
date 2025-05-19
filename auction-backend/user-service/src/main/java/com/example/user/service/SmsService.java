package com.example.user.service;

import com.twilio.rest.api.v2010.account.Message;
import com.twilio.type.PhoneNumber;
import com.twilio.Twilio;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class SmsService {

    @Value("${twilio.account.sid}")
    private String sid;

    @Value("${twilio.auth.token}")
    private String token;

    @Value("${twilio.phone.number}") // Số điện thoại gửi từ Twilio
    private String fromPhone;

    public void sendOtpSms(String toPhone, String otp) {
        Twilio.init(sid, token);
        Message.creator(
                new PhoneNumber(toPhone),
                new PhoneNumber(fromPhone),
                "Your OTP code is: " + otp
        ).create();
    }
}
