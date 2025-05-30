package com.example.user.Dtos;

public class VerificationStatusResponse {
    private boolean phoneVerified;
    private String phoneStatus;       // "UNVERIFIED", "VERIFIED"
    private String citizenId;
    private String cccdStatus;        // "PENDING", "APPROVED", "REJECTED", "NOT_SUBMITTED"

    public VerificationStatusResponse(
            boolean phoneVerified,
            String phoneStatus,
            String citizenId,
            String cccdStatus
    ) {
        this.phoneVerified = phoneVerified;
        this.phoneStatus = phoneStatus;
        this.citizenId = citizenId;
        this.cccdStatus = cccdStatus;
    }

    public boolean isPhoneVerified() {
        return phoneVerified;
    }

    public String getPhoneStatus() {
        return phoneStatus;
    }

    public String getCitizenId() {
        return citizenId;
    }

    public String getCccdStatus() {
        return cccdStatus;
    }
}
