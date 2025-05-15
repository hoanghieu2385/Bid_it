package com.example.user.service;

import com.example.user.Dtos.*;
import com.example.user.config.JwtUtil;
import com.example.user.model.OtpType;
import com.example.user.model.PasswordResetToken;
import com.example.user.model.Role;
import com.example.user.model.User;
import com.example.user.repository.BankRepository;
import com.example.user.repository.PasswordResetTokenRepository;
import com.example.user.repository.UserRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.time.ZoneId;
import java.time.ZonedDateTime;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

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
    ZoneId vietnamZone = ZoneId.of("Asia/Ho_Chi_Minh");
    LocalDateTime nowInVietnam = ZonedDateTime.now(vietnamZone).toLocalDateTime();

    @Value("${app.base-url}")
    private String appBaseUrl;

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
        // Check if email already exists
        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already exists");
        }

        // Create a new user with email, password, first name, and last name
        User user = new User();
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setFirstName(request.getFirstName());
        user.setLastName(request.getLastName());

        // Set default or placeholder values for other required fields
        user.setPhoneNumber(request.getPhoneNumber() != null ? request.getPhoneNumber() : null);
        user.setBankAccountNumber(request.getBankAccountNumber() != null ? request.getBankAccountNumber() : null);


        // Get a default bank or the first one available
        try {
            user.setBank(bankRepository.findById(1L).orElse(null));
        } catch (Exception e) {
            // If no bank is available, we'll handle this later when the user completes their profile
        }

        // Set other required fields
        user.setCreatedAt(nowInVietnam);
        user.setEnable(false); // User is disabled until email verification
        user.setVerified(false);
        user.setLocked(false);
        user.setScore(0);
        user.addRole(Role.USER);

        userRepository.save(user);

        // Send verification email
        verificationTokenService.sendVerificationToken(user.getEmail());

        return new RegisterResponse("Registration successful. Please check your email for the verification link. You'll need to complete your profile after verification.");
    }

    // Rest of the methods remain unchanged
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

        boolean isValid = otpService.verifyOtp(request.getEmail(), request.getOtp(), OtpType.EMAIL_VERIFICATION);
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

        boolean isValid = otpService.verifyOtp(request.getEmail(), request.getOtp(), OtpType.LOGIN);
        if (!isValid) {
            throw new RuntimeException("Invalid or expired OTP");
        }

        String token = jwtUtil.generateToken(user.getEmail());

        List<String> roleNames = user.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toList());

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhoneNumber(),
                user.getAddress(),
                user.getScore(),
                roleNames
        );
    }

    public AuthResponse authenticate(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Email does not exist"));

        if (!user.getVerified()) {
            throw new RuntimeException("Email is not verified");
        }

        if (user.getLocked()) {
            throw new RuntimeException("Account is locked");
        }

        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Incorrect email or password");
        }

        String token = jwtUtil.generateToken(user.getEmail());

        List<String> roleNames = user.getRoles().stream()
                .map(Enum::name)
                .collect(Collectors.toList());

        return new AuthResponse(
                token,
                user.getId(),
                user.getEmail(),
                user.getFirstName(),
                user.getLastName(),
                user.getPhoneNumber(),
                user.getAddress(),
                user.getScore(),
                roleNames
        );
    }

    public ForgotPasswordResponse forgotPassword(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found with email: " + email));

        String resetToken = generateRandomToken();

        PasswordResetToken passwordResetToken = passwordResetTokenRepository.findByUser(user)
                .orElse(new PasswordResetToken());

        passwordResetToken.setToken(resetToken);
        passwordResetToken.setUser(user);
        passwordResetToken.setExpiryDate(LocalDateTime.now().plusHours(1));
        passwordResetTokenRepository.save(passwordResetToken);

        emailService.sendPasswordResetEmail(email, resetToken);

        return new ForgotPasswordResponse(true, "Password reset link has been sent to your email");
    }

    public ResetPasswordResponse resetPassword(ResetPasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new RuntimeException("Passwords do not match");
        }

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + request.getEmail()));

        PasswordResetToken resetToken = passwordResetTokenRepository.findByTokenAndUser(request.getToken(), user)
                .orElseThrow(() -> new RuntimeException("Invalid or expired token"));

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            passwordResetTokenRepository.delete(resetToken);
            throw new RuntimeException("Token has expired. Please request a new password reset");
        }

        user.setPassword(passwordEncoder.encode(request.getNewPassword()));
        user.setUpdatedAt(nowInVietnam);
        userRepository.save(user);

        passwordResetTokenRepository.delete(resetToken);

        return new ResetPasswordResponse(true, "Password has been reset successfully");
    }

    private String generateRandomToken() {
        byte[] randomBytes = new byte[32];
        new SecureRandom().nextBytes(randomBytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(randomBytes);
    }

    public CompleteProfileResponse completeProfile(String email, CompleteProfileRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Verify that the user has verified their email
        if (!user.getVerified()) {
            throw new RuntimeException("Please verify your email before completing your profile");
        }

        // Check if phone number already exists for another user
        userRepository.findByPhoneNumber(request.getPhoneNumber())
                .ifPresent(existingUser -> {
                    if (!existingUser.getId().equals(user.getId())) {
                        throw new RuntimeException("Phone number already in use by another account");
                    }
                });

        // Get bank by ID
        var bank = bankRepository.findById(request.getBankId())
                .orElseThrow(() -> new RuntimeException("Bank not found"));

        // Update user profile
        user.setPhoneNumber(request.getPhoneNumber());
        user.setAddress(request.getAddress());
        user.setBank(bank);
        user.setBankAccountNumber(request.getBankAccountNumber());
        user.setUpdatedAt(nowInVietnam);

        userRepository.save(user);

        return new CompleteProfileResponse(true, "Profile completed successfully");
    }
}