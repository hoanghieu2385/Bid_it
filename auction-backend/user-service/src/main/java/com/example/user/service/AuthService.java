package com.example.user.service;

import com.example.user.Dtos.*;
import com.example.user.config.JwtUtil;
import com.example.user.model.Bank;
import com.example.user.model.OtpType;
import com.example.user.model.PasswordResetToken;
import com.example.user.model.User;
import com.example.user.repository.BankRepository;
import com.example.user.repository.PasswordResetTokenRepository;
import com.example.user.repository.UserRepository;
import lombok.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final BankRepository bankRepository;
    private final OtpService otpService;
    private final VerificationTokenService verificationTokenService;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final EmailService emailService;

    @Value("${app.base-url}")
    private String appBaseUrl;
    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        Bank bank = bankRepository.findById(request.getBankId())
                .orElseThrow(() -> new RuntimeException("Bank not found"));
        User user = User.builder()
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .password(passwordEncoder.encode(request.getPassword()))
                .phoneNumber(request.getPhoneNumber())
                .address(request.getAddress())
                .bank(bank)
                .bankAccountNumber(request.getBankAccountNumber())
                .createdAt(LocalDateTime.now())
                .enable(false)
                .verified(false)
                .locked(false)
                .score(0)
                .build();

        userRepository.save(user);

        // Gửi link xác thực qua email thay vì OTP
        verificationTokenService.sendVerificationToken(user.getEmail());

        return new RegisterResponse("Registration successful. Please check your email for verification link.");
    }

    // Phương thức mới để xác thực email bằng token
    public VerificationResponse verifyAccountByToken(String email, String token) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getVerified()) {
            return new VerificationResponse("Email already verified");
        }

        boolean isValid = verificationTokenService.verifyToken(email, token);

        if (!isValid) {
            return new VerificationResponse("Invalid or expired verification link");
        }

        user.setVerified(true);
        user.setEnable(true);
        user.setVerifiedResponse("Email verified successfully");
        userRepository.save(user);

        return new VerificationResponse("Email verified successfully");
    }

    // Giữ lại phương thức cũ cho khả năng tương thích ngược
    public VerificationResponse verifyEmail(VerificationRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (user.getVerified()) {
            return new VerificationResponse("Email already verified");
        }

        boolean isValid = otpService.verifyOtp(
                request.getEmail(),
                request.getOtp(),
                OtpType.EMAIL_VERIFICATION
        );

        if (!isValid) {
            return new VerificationResponse("Invalid or expired OTP");
        }

        user.setVerified(true);
        user.setEnable(true);
        user.setVerifiedResponse("Email verified successfully");
        userRepository.save(user);

        return new VerificationResponse("Email verified successfully");
    }

    public OtpResponse requestLoginOtp(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getVerified()) {
            throw new RuntimeException("Email not verified");
        }

        if (user.getLocked()) {
            throw new RuntimeException("Account is locked");
        }

        otpService.sendLoginOtp(email);
        return new OtpResponse("OTP sent to your email");
    }

    public AuthResponse authenticateWithOtp(OtpLoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        boolean isValid = otpService.verifyOtp(
                request.getEmail(),
                request.getOtp(),
                OtpType.LOGIN
        );

        if (!isValid) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token);
    }

    public AuthResponse authenticate(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getVerified()) {
            throw new RuntimeException("Email not verified");
        }

        if (user.getLocked()) {
            throw new RuntimeException("Account is locked");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token);
    }
   // FORGOT PASSWORD

    public ForgotPasswordResponse forgotPassword(String email) {
        // Check if user exists
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        // Generate a reset token
        String resetToken = generateRandomToken();

        // Save the token with expiration time
        PasswordResetToken passwordResetToken = new PasswordResetToken();
        passwordResetToken.setToken(resetToken);
        passwordResetToken.setUser(user);
        passwordResetToken.setExpiryDate(LocalDateTime.now().plusHours(24)); // Token valid for 24 hours
        passwordResetTokenRepository.save(passwordResetToken);

        // Send reset password email
        String resetLink = appBaseUrl + "/auth/reset-password?token=" + resetToken + "&email=" + email;
        String emailContent = "Please click on the link below to reset your password:\n" + resetLink;
        emailService.sendEmail(email, "Password Reset Request", emailContent);

        return new ForgotPasswordResponse(true, "Password reset link has been sent to your email");
    }

    public ResetPasswordResponse resetPassword(ResetPasswordRequest request) {
        // Validate passwords match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + request.getEmail()));

        // Validate token
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenAndUser(request.getToken(), user)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        // Check if token is expired
        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new RuntimeException("Token has expired. Please request a new password reset");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        // Delete used token
        passwordResetTokenRepository.delete(resetToken);

        return new ResetPasswordResponse(true, "Password has been reset successfully");
    }

    private String generateRandomToken() {
        byte[] randomBytes = new byte[32];
        new SecureRandom().nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
}