package com.example.user.Dtos;

import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class VerificationResponse {
    private String message;

    // Keep only one constructor
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