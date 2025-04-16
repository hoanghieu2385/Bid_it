package com.example.auction.dto;

import jakarta.validation.constraints.NotBlank;

public class AuctionStatusUpdateDTO {

    @NotBlank(message = "Status is required")
    private String status;

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public AuctionStatusUpdateDTO() {
    }

    public AuctionStatusUpdateDTO(String status) {}
}
