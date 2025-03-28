package com.example.user.service;

import com.example.user.Dtos.AuthResponse;
import com.example.user.Dtos.LoginRequest;
import com.example.user.Dtos.RegisterRequest;
import com.example.user.config.JwtUtil;
import com.example.user.model.Bank;
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

    public AuthResponse register(RegisterRequest request) {
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
                .score(0) // Default score của user. Nếu muốn user có score default khác khi tạo tk mới thì chỉnh cả trong model và đây
                .build();

        userRepository.save(user);
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token);
    }

    public AuthResponse authenticate(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found"));
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }
        String token = jwtUtil.generateToken(user.getEmail());
        return new AuthResponse(token);
    }
}
