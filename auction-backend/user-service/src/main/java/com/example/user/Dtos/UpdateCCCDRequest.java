package com.example.user.Dtos;

public class UpdateCCCDRequest {
    private String citizenId;
    private String citizenIdFrontImage;
    private String citizenIdBackImage;

    public UpdateCCCDRequest() {
    }

    public UpdateCCCDRequest(String citizenId, String citizenIdFrontImage, String citizenIdBackImage) {
        this.citizenId = citizenId;
        this.citizenIdFrontImage = citizenIdFrontImage;
        this.citizenIdBackImage = citizenIdBackImage;
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
