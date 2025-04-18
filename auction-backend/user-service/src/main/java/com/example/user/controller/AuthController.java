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

    @PostMapping("/register")
    @ResponseBody
    public ResponseEntity<RegisterResponse> register(@RequestBody RegisterRequest request) {
        try {
            return ResponseEntity.ok(authService.register(request));
        } catch (Exception e) {
            e.printStackTrace(); // log lỗi ra console
            return ResponseEntity.internalServerError().build();
        }
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

    // RESET PASSWORD
    @PostMapping("/forgot-password")
    @ResponseBody
    public ResponseEntity<ForgotPasswordResponse> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        return ResponseEntity.ok(authService.forgotPassword(request.getEmail()));
    }

    @GetMapping("/reset-password")
    public String showResetPasswordForm(@RequestParam String token,
                                        @RequestParam String email,
                                        Model model) {
        model.addAttribute("token", token);
        model.addAttribute("email", email);
        return "reset-password";
    }

    @PostMapping("/reset-password")
    @ResponseBody
    public ResponseEntity<ResetPasswordResponse> resetPassword(@RequestBody ResetPasswordRequest request) {
        return ResponseEntity.ok(authService.resetPassword(request));
    }
}