package com.example.user.controller;

import com.example.user.Dtos.AuthResponse;
import com.example.user.Dtos.LoginRequest;
import com.example.user.Dtos.RegisterRequest;
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
    public ResponseEntity<AuthResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.authenticate(request));
    }

    @GetMapping("/generate-token")
    public ResponseEntity<String> generateToken(@RequestParam String email) {
        String token = jwtUtil.generateToken(email);
        return ResponseEntity.ok(token);
    }
}
