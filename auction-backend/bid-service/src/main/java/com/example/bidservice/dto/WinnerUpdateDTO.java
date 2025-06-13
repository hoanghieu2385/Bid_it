package com.example.bidservice.dto;

public class WinnerUpdateDTO {
    private Long winnerId;

    public WinnerUpdateDTO() {}

    public WinnerUpdateDTO(Long winnerId) {
        this.winnerId = winnerId;
    }

    public Long getWinnerId() {
        return winnerId;
    }

    public void setWinnerId(Long winnerId) {
        this.winnerId = winnerId;
    }
}
