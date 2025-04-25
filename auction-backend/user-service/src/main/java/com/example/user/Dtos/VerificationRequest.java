package com.example.user.Dtos;

public class VerificationRequest {
    private String email;
    private String otp;

    public VerificationRequest() {
    }

    public VerificationRequest(String email, String otp) {
        this.email = email;
        this.otp = otp;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getOtp() {
        return otp;
    }

    public void setOtp(String otp) {
        this.otp = otp;
    }
}
