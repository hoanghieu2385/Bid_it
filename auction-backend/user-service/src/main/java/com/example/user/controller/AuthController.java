package com.example.user.controller;

import com.example.user.Dtos.*;
import com.example.user.config.JwtUtil;
import com.example.user.service.AuthService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.Map;

@Controller
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;
    private final JwtUtil jwtUtil;

    // Constructor thủ công thay cho @RequiredArgsConstructor
    public AuthController(AuthService authService, JwtUtil jwtUtil) {
        this.authService = authService;
        this.jwtUtil = jwtUtil;
    }

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

    @GetMapping("/auth/ping-authenticated")
    @ResponseBody
    public ResponseEntity<String> pingAuthenticated() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        return ResponseEntity.ok("Authenticated as: " + auth.getName() +
                ", Principal: " + auth.getPrincipal() +
                ", Authorities: " + auth.getAuthorities());
    }

    @PostMapping("/register")
    @ResponseBody
    public ResponseEntity<?> register(@Valid @RequestBody RegisterRequest request) {
        try {
            return ResponseEntity.ok(authService.register(request));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(new RegisterResponse(e.getMessage()));
        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.internalServerError().body(new RegisterResponse("Internal server error"));
        }
    }


    @PostMapping("/verify-email")
    @ResponseBody
    public ResponseEntity<VerificationResponse> verifyEmail(@RequestBody VerificationRequest request) {
        return ResponseEntity.ok(authService.verifyEmail(request));
    }

    @PostMapping("/login")
    @ResponseBody
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            AuthResponse authResponse = authService.authenticate(request);
            return ResponseEntity.ok(authResponse); // chứa token và user info
        } catch (RuntimeException e) {
            return ResponseEntity.status(401).body(Map.of("message", e.getMessage()));
        }
    }

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

    @PostMapping("/change-password")
    @ResponseBody
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest request) {
        try {
            authService.changePassword(request);
            return ResponseEntity.ok(Map.of("message", "Password changed successfully"));
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(Map.of("message", e.getMessage()));
        }
    }
}
