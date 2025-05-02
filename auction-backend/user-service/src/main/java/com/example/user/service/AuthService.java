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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;

@Service
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

    // Constructor manually created to replace @RequiredArgsConstructor
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtUtil jwtUtil,
                       BankRepository bankRepository, OtpService otpService, VerificationTokenService verificationTokenService,
                       PasswordResetTokenRepository passwordResetTokenRepository, EmailService emailService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
        this.bankRepository = bankRepository;
        this.otpService = otpService;
        this.verificationTokenService = verificationTokenService;
        this.passwordResetTokenRepository = passwordResetTokenRepository;
        this.emailService = emailService;
    }

    public RegisterResponse register(RegisterRequest request) {
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        Bank bank = bankRepository.findById(request.getBankId())
                .orElseThrow(() -> new RuntimeException("Bank not found"));
        User user = new User();
        user.setEmail(request.getEmail());
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());
        user.setBank(bank);
        user.setBankAccountNumber(request.getBankAccountNumber());
        user.setCreatedAt(LocalDateTime.now());
        user.setEnable(false);
        user.setVerified(false);
        user.setLocked(false);
        user.setScore(0);

        userRepository.save(user);

        verificationTokenService.sendVerificationToken(user.getEmail());

        return new RegisterResponse("Registration successful. Please check your email for verification link.");
    }

    // Xac nhan email = token
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
        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhoneNumber(),
                user.getAddress(),
                user.getScore()
        );
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

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhoneNumber(),
                user.getAddress(),
                user.getScore()
        );
    }

    public ForgotPasswordResponse forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        // Create reset password token
        String resetToken = generateRandomToken();

        // Check if user already has a password reset request
        PasswordResetToken passwordResetToken = passwordResetTokenRepository.findByUser(user)
                .orElse(new PasswordResetToken());

        passwordResetToken.setToken(resetToken);
        passwordResetToken.setUser(user);
        passwordResetToken.setExpiryDate(LocalDateTime.now().plusHours(1)); // Set token validity period
        passwordResetTokenRepository.save(passwordResetToken);

        // Send email with reset password link
        emailService.sendPasswordResetEmail(email, resetToken);

        return new ForgotPasswordResponse(true, "Password reset link has been sent to your email");
    }

    public ResetPasswordResponse resetPassword(ResetPasswordRequest request) {
        // Check if passwords match
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        // Find user by email
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + request.getEmail()));

        // Check token
        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenAndUser(request.getToken(), user)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        // Check if token has expired
        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new RuntimeException("Token has expired. Please request a new password reset");
        }

        // Update password
        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);

        // Delete token after password reset
        passwordResetTokenRepository.delete(resetToken);

        return new ResetPasswordResponse(true, "Password has been reset successfully");
    }

    private String generateRandomToken() {
        byte[] randomBytes = new byte[32];
        new SecureRandom().nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }
}
