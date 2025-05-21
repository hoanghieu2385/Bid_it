package com.example.user.repository;

import com.example.user.model.Otp;
import com.example.user.model.OtpType;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OtpRepository extends JpaRepository<Otp, Long> {
    Optional<Otp> findByContactAndCodeAndTypeAndUsedFalse(String contact, String code, OtpType type);
}