package com.example.bid.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class BidDTO {

    private BigDecimal amount;
    private LocalDateTime createdAt;

    // Getters and setters
    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
