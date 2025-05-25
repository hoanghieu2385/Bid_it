package com.example.user.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "otps")
public class Otp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Thay thế email bằng contact (có thể là email hoặc số điện thoại)
    @Column(nullable = false)
    private String contact;

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

    // Full constructor
    public Otp(Long id, String contact, String code, LocalDateTime expiryDate, Boolean used, OtpType type) {
        this.id = id;
        this.contact = contact;
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

    public String getContact() {
        return contact;
    }

    public void setContact(String contact) {
        this.contact = contact;
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

    // Builder static method
    public static OtpBuilder builder() {
        return new OtpBuilder();
    }

    // Custom builder class
    public static class OtpBuilder {
        private Long id;
        private String contact;
        private String code;
        private LocalDateTime expiryDate;
        private Boolean used = false;
        private OtpType type;

        public OtpBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public OtpBuilder contact(String contact) {
            this.contact = contact;
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
            return new Otp(id, contact, code, expiryDate, used, type);
        }
    }
}
