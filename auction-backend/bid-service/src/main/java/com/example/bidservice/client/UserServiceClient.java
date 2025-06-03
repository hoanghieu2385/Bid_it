package com.example.bidservice.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service", url = "${app.services.user-service}")
public interface UserServiceClient {

    @GetMapping("/api/users/{id}")
    UserResponse getUserById(@PathVariable("id") Long id);

    // UserResponse class khớp với User entity từ user-service
    class UserResponse {
        private Long id;
        private String email;
        private String firstName;
        private String lastName;
        private String avatar;
        private String phoneNumber;
        private String address;
        private String citizenId;
        private Integer verifiedAccount;
        private boolean phoneVerified;
        private Integer score;
        private Boolean enable;
        private Boolean verified;
        private Boolean locked;

        // Constructors
        public UserResponse() {}

        public UserResponse(Long id, String email, String firstName, String lastName) {
            this.id = id;
            this.email = email;
            this.firstName = firstName;
            this.lastName = lastName;
        }

        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }

        public String getFirstName() { return firstName; }
        public void setFirstName(String firstName) { this.firstName = firstName; }

        public String getLastName() { return lastName; }
        public void setLastName(String lastName) { this.lastName = lastName; }

        public String getAvatar() { return avatar; }
        public void setAvatar(String avatar) { this.avatar = avatar; }

        public String getPhoneNumber() { return phoneNumber; }
        public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

        public String getAddress() { return address; }
        public void setAddress(String address) { this.address = address; }

        public String getCitizenId() { return citizenId; }
        public void setCitizenId(String citizenId) { this.citizenId = citizenId; }

        public Integer getVerifiedAccount() { return verifiedAccount; }
        public void setVerifiedAccount(Integer verifiedAccount) { this.verifiedAccount = verifiedAccount; }

        public boolean isPhoneVerified() { return phoneVerified; }
        public void setPhoneVerified(boolean phoneVerified) { this.phoneVerified = phoneVerified; }

        public Integer getScore() { return score; }
        public void setScore(Integer score) { this.score = score; }

        public Boolean getEnable() { return enable; }
        public void setEnable(Boolean enable) { this.enable = enable; }

        public Boolean getVerified() { return verified; }
        public void setVerified(Boolean verified) { this.verified = verified; }

        public Boolean getLocked() { return locked; }
        public void setLocked(Boolean locked) { this.locked = locked; }

        // Helper methods
        public String getFullName() {
            return ((firstName != null ? firstName : "") +
                    (lastName != null ? " " + lastName : "")).trim();
        }

        public String getUsername() {
            // Fallback to email if no separate username field
            return email;
        }
    }
}