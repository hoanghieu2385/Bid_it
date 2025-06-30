package com.example.auction.dto;

import java.util.List;

public class UserDTO {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String avatar;
    private String avatarPublicId;
    private String phoneNumber;
    private String address;

    // Bank or PayPal
    private String bankAccountNumber;

    private Integer score;
    private Boolean verified;
    private String verifiedResponse;
    private Boolean locked;

    private String citizenIdStatus; // ✅ Add this (APPROVED, PENDING, REJECTED, NONE)

    private List<String> roles;

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

    public String getFirstName() {
        return firstName;
    }

    public void setFirstName(String firstName) {
        this.firstName = firstName;
    }

    public String getLastName() {
        return lastName;
    }

    public void setLastName(String lastName) {
        this.lastName = lastName;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }

    public String getAvatarPublicId() {
        return avatarPublicId;
    }

    public void setAvatarPublicId(String avatarPublicId) {
        this.avatarPublicId = avatarPublicId;
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

    public String getBankAccountNumber() {
        return bankAccountNumber;
    }

    public void setBankAccountNumber(String bankAccountNumber) {
        this.bankAccountNumber = bankAccountNumber;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public Boolean getVerified() {
        return verified;
    }

    public void setVerified(Boolean verified) {
        this.verified = verified;
    }

    public String getVerifiedResponse() {
        return verifiedResponse;
    }

    public void setVerifiedResponse(String verifiedResponse) {
        this.verifiedResponse = verifiedResponse;
    }

    public Boolean getLocked() {
        return locked;
    }

    public void setLocked(Boolean locked) {
        this.locked = locked;
    }

    public String getCitizenIdStatus() {
        return citizenIdStatus;
    }

    public void setCitizenIdStatus(String citizenIdStatus) {
        this.citizenIdStatus = citizenIdStatus;
    }

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
}
