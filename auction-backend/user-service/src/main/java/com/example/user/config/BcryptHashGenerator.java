package com.example.user.config;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

public class BcryptHashGenerator {
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        System.out.println(encoder.encode("admin"));
    }
}
