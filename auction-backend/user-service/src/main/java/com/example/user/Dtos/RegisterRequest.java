package com.example.user.Dtos;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
public class RegisterRequest {
    private String email;
    private String firstName;
    private String lastName;
    private String password;
    private String phoneNumber;
    private String address;
    private Long bankId;
    private String bankAccountNumber;
}
