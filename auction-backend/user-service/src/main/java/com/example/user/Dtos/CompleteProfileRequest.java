package com.example.user.Dtos;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class CompleteProfileRequest {

    @NotBlank(message = "Phone number is required")
    @Size(min = 10, max = 11, message = "Phone number must be 10 or 11 digits")
    @Pattern(regexp = "\\d+", message = "Phone number must contain only digits")
    private String phoneNumber;

    private String address;

    @NotBlank(message = "Bank ID is required")
    private Long bankId;

    @NotBlank(message = "Bank account number is required")
    private String bankAccountNumber;

    public CompleteProfileRequest() {
    }

    public CompleteProfileRequest(String phoneNumber, String address, Long bankId, String bankAccountNumber) {
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.bankId = bankId;
        this.bankAccountNumber = bankAccountNumber;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }

    public String getAddress() {
        return address;
    }

    public void setAddress(String address) {
        this.address = address;
    }

    public Long getBankId() {
        return bankId;
    }

    public void setBankId(Long bankId) {
        this.bankId = bankId;
    }

    public String getBankAccountNumber() {
        return bankAccountNumber;
    }

    public void setBankAccountNumber(String bankAccountNumber) {
        this.bankAccountNumber = bankAccountNumber;
    }
}