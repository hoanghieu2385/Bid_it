package com.example.user.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "otps")
public class Otp {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String code;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    @Column(nullable = false)
    private Boolean used = false;

    @Column(nullable = false)
    private OtpType type;

    // Default constructor
    public Otp() {
    }

    // Constructor with parameters
    public Otp(Long id, String email, String code, LocalDateTime expiryDate, Boolean used, OtpType type) {
        this.id = id;
        this.email = email;
        this.code = code;
        this.expiryDate = expiryDate;
        this.used = used;
        this.type = type;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getCode() {
        return code;
    }

    public void setCode(String code) {
        this.code = code;
    }

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }

    public Boolean getUsed() {
        return used;
    }

    public void setUsed(Boolean used) {
        this.used = used;
    }

    public OtpType getType() {
        return type;
    }

    public void setType(OtpType type) {
        this.type = type;
    }

    // Optional: Builder method if needed
    public static OtpBuilder builder() {
        return new OtpBuilder();
    }

    // OtpBuilder class to mimic builder pattern
    public static class OtpBuilder {
        private Long id;
        private String email;
        private String code;
        private LocalDateTime expiryDate;
        private Boolean used = false;
        private OtpType type;

        public OtpBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public OtpBuilder email(String email) {
            this.email = email;
            return this;
        }

        public OtpBuilder code(String code) {
            this.code = code;
            return this;
        }

        public OtpBuilder expiryDate(LocalDateTime expiryDate) {
            this.expiryDate = expiryDate;
            return this;
        }

        public OtpBuilder used(Boolean used) {
            this.used = used;
            return this;
        }

        public OtpBuilder type(OtpType type) {
            this.type = type;
            return this;
        }

        public Otp build() {
            return new Otp(id, email, code, expiryDate, used, type);
        }
    }
}
