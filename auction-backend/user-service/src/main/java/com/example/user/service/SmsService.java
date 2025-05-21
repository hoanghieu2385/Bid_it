package com.example.user.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Base64;

@Service
public class SmsService {

    @Value("${twilio.account.sid}")
    private String accountSid;

    @Value("${twilio.auth.token}")
    private String authToken;

    @Value("${twilio.verify.sid}")
    private String verifyServiceSid;

    private final RestTemplate restTemplate = new RestTemplate();

    public void sendOtpSms(String toPhone) {
        System.out.println("Raw input phone: [" + toPhone + "]");

        toPhone = toPhone.trim();
        if (!toPhone.startsWith("+")) {
            toPhone = "+" + toPhone;
        }

        System.out.println("Formatted phone to send: [" + toPhone + "]");

        String url = "https://verify.twilio.com/v2/Services/" + verifyServiceSid + "/Verifications";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        String auth = accountSid + ":" + authToken;
        String encodedAuth = Base64.getEncoder().encodeToString(auth.getBytes());
        headers.set("Authorization", "Basic " + encodedAuth);

        // 💡 Encode phone number
        String encodedPhone = URLEncoder.encode(toPhone, StandardCharsets.UTF_8);
        String body = "To=" + encodedPhone + "&Channel=sms";

        HttpEntity<String> request = new HttpEntity<>(body, headers);

        try {
            ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);
            System.out.println("Send OTP status: " + response.getStatusCode());
            System.out.println("Response body: " + response.getBody());
        } catch (Exception e) {
            System.err.println("Failed to send OTP: " + e.getMessage());
            throw e;
        }
    }


    public boolean checkOtp(String toPhone, String otpCode) {
        String url = "https://verify.twilio.com/v2/Services/" + verifyServiceSid + "/VerificationCheck";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        String auth = accountSid + ":" + authToken;
        headers.set("Authorization", "Basic " + Base64.getEncoder().encodeToString(auth.getBytes()));

        String body = "To=" + toPhone + "&Code=" + otpCode;

        HttpEntity<String> request = new HttpEntity<>(body, headers);
        ResponseEntity<String> response = restTemplate.exchange(url, HttpMethod.POST, request, String.class);

        System.out.println("Verify OTP response: " + response.getStatusCode());
        System.out.println("Body: " + response.getBody());

        return response.getBody() != null && response.getBody().contains("\"status\": \"approved\"");
    }
}
