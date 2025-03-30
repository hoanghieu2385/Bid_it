package com.example.user.service;

import com.example.user.Dtos.*;
import com.example.user.config.JwtUtil;
import com.example.user.model.Bank;
import com.example.user.model.OtpType;
import com.example.user.model.User;
import com.example.user.repository.BankRepository;
import com.example.user.repository.UserRepository;
import lombok.*;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final BankRepository bankRepository;
    private final OtpService otpService;

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

        // Gửi OTP xác thực qua email
        otpService.sendVerificationOtp(user.getEmail());

        return new RegisterResponse("Registration successful. Please check your email for verification code.");
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
}