package com.example.user.controller;

import com.example.user.Dtos.*;
import com.example.user.config.JwtUtil;
import com.example.user.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    // Endpoint mới để xử lý xác thực qua link
    @GetMapping("/verify-account")
    public ResponseEntity<VerificationResponse> verifyAccount(
            @RequestParam String token,
            @RequestParam String email) {
        return ResponseEntity.ok(authService.verifyAccountByToken(email, token));
    }

    // Giữ lại endpoint cũ cho khả năng tương thích ngược
    @PostMapping("/verify-email")
    public ResponseEntity<VerificationResponse> verifyEmail(@RequestBody VerificationRequest request) {
        return ResponseEntity.ok(authService.verifyEmail(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.authenticate(request));
    }

    @PostMapping("/request-otp")
    public ResponseEntity<OtpResponse> requestOtp(@RequestParam String email) {
        return ResponseEntity.ok(authService.requestLoginOtp(email));
    }

    @PostMapping("/login-with-otp")
    public ResponseEntity<AuthResponse> loginWithOtp(@RequestBody OtpLoginRequest request) {
        return ResponseEntity.ok(authService.authenticateWithOtp(request));
    }

    @GetMapping("/generate-token")
    public ResponseEntity<String> generateToken(@RequestParam String email) {
        String token = jwtUtil.generateToken(email);
        return ResponseEntity.ok(token);
    }
}