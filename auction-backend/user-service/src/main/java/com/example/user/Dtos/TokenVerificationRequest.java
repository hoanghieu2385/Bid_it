package com.example.user.Dtos;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class TokenVerificationRequest {
    private String email;
    private String token;
}