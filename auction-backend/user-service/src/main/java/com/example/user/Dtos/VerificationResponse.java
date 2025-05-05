package com.example.user.Dtos;

public class VerificationResponse {
    private String message;

    public VerificationResponse() {
    }

    public VerificationResponse(String message) {
        this.message = message;
    }

    // Helper method to determine if response indicates success
    public boolean isSuccess() {
        return message != null &&
                (message.contains("success") ||
                        message.equals("Email verified successfully") ||
                        message.equals("Email already verified"));
    }
}
