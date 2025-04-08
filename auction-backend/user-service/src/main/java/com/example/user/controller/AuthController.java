package com.example.user.controller;

import com.example.user.Dtos.*;
import com.example.user.config.JwtUtil;
import com.example.user.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

@Controller  // Change from @RestController to @Controller
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final JwtUtil jwtUtil;

    // This method will now return a view template
    @GetMapping("/verify-account")
    public String verifyAccount(
            @RequestParam String token,
            @RequestParam String email,
            Model model) {
        try {
            VerificationResponse response = authService.verifyAccountByToken(email, token);
            model.addAttribute("message", response.getMessage());
            model.addAttribute("success", response.isSuccess());
        } catch (RuntimeException e) {
            model.addAttribute("message", e.getMessage());
            model.addAttribute("success", false);
        }
        return "verification-result";
    }

    // For your REST endpoints, use @ResponseBody to indicate they return data, not views
    @PostMapping("/register")
    @ResponseBody
    public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest request) {
        return ResponseEntity.ok(authService.register(request));
    }

    @PostMapping("/verify-email")
    @ResponseBody
    public ResponseEntity<VerificationResponse> verifyEmail(@RequestBody VerificationRequest request) {
        return ResponseEntity.ok(authService.verifyEmail(request));
    }

    @PostMapping("/login")
    @ResponseBody
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        return ResponseEntity.ok(authService.authenticate(request));
    }

    @PostMapping("/request-otp")
    @ResponseBody
    public ResponseEntity<OtpResponse> requestOtp(@RequestParam String email) {
        return ResponseEntity.ok(authService.requestLoginOtp(email));
    }

    @PostMapping("/login-with-otp")
    @ResponseBody
    public ResponseEntity<AuthResponse> loginWithOtp(@RequestBody OtpLoginRequest request) {
        return ResponseEntity.ok(authService.authenticateWithOtp(request));
    }

    @GetMapping("/generate-token")
    @ResponseBody
    public ResponseEntity<String> generateToken(@RequestParam String email) {
        String token = jwtUtil.generateToken(email);
        return ResponseEntity.ok(token);
    }
}