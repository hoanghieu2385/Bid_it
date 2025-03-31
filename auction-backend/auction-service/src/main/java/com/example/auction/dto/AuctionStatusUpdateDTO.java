package com.example.auction.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class AuctionStatusUpdateDTO {
    @NotBlank(message = "Status is required")
    private String status;
}
