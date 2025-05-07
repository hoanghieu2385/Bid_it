package com.example.user.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "password_reset_tokens")
public class PasswordResetToken {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String token;

    @OneToOne(targetEntity = User.class, fetch = FetchType.EAGER)
    @JoinColumn(nullable = false, name = "user_id")
    private User user;

    @Column(nullable = false)
    private LocalDateTime expiryDate;

    // Default constructor
    public PasswordResetToken() {
    }

    // Constructor with parameters
    public PasswordResetToken(Long id, String token, User user, LocalDateTime expiryDate) {
        this.id = id;
        this.token = token;
        this.user = user;
        this.expiryDate = expiryDate;
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public User getUser() {
        return user;
    }

    public void setUser(User user) {
        this.user = user;
    }

    public LocalDateTime getExpiryDate() {
        return expiryDate;
    }

    public void setExpiryDate(LocalDateTime expiryDate) {
        this.expiryDate = expiryDate;
    }

    // Optional: Builder method if needed
    public static PasswordResetTokenBuilder builder() {
        return new PasswordResetTokenBuilder();
    }

    // PasswordResetTokenBuilder class to mimic builder pattern
    public static class PasswordResetTokenBuilder {
        private Long id;
        private String token;
        private User user;
        private LocalDateTime expiryDate;

        public PasswordResetTokenBuilder id(Long id) {
            this.id = id;
            return this;
        }

        public PasswordResetTokenBuilder token(String token) {
            this.token = token;
            return this;
        }

        public PasswordResetTokenBuilder user(User user) {
            this.user = user;
            return this;
        }

        public PasswordResetTokenBuilder expiryDate(LocalDateTime expiryDate) {
            this.expiryDate = expiryDate;
            return this;
        }

        public PasswordResetToken build() {
            return new PasswordResetToken(id, token, user, expiryDate);
        }
    }
}
