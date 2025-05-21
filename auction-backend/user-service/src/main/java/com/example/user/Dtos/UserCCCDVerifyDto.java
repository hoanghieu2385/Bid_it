package com.example.user.Dtos;

public class UserCCCDVerifyDto {
    private Long id;
    private String email;
    private String fullName;
    private String citizenId;
    private String citizenIdFrontImage;
    private String citizenIdBackImage;

    public UserCCCDVerifyDto() {
    }

    public UserCCCDVerifyDto(Long id, String email, String fullName, String citizenId, String citizenIdFrontImage, String citizenIdBackImage) {
        this.id = id;
        this.email = email;
        this.fullName = fullName;
        this.citizenId = citizenId;
        this.citizenIdFrontImage = citizenIdFrontImage;
        this.citizenIdBackImage = citizenIdBackImage;
    }

    // Getters & Setters

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

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getCitizenId() {
        return citizenId;
    }

    public void setCitizenId(String citizenId) {
        this.citizenId = citizenId;
    }

    public String getCitizenIdFrontImage() {
        return citizenIdFrontImage;
    }

    public void setCitizenIdFrontImage(String citizenIdFrontImage) {
        this.citizenIdFrontImage = citizenIdFrontImage;
    }

    public String getCitizenIdBackImage() {
        return citizenIdBackImage;
    }

    public void setCitizenIdBackImage(String citizenIdBackImage) {
        this.citizenIdBackImage = citizenIdBackImage;
    }
}
