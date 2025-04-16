package com.example.user.Dtos;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class OtpLoginRequest {
    private String email;
    private String otp;
}