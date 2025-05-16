package com.example.user.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String firstName;

    @Column(nullable = false)
    private String lastName;

    @Column(nullable = false)
    private String password;

    private String avatar;
    private String avatarPublicId;

    @Column(nullable = true, unique = true)
    private String phoneNumber;

    @Column
    private String address;

    // CCCD ( CHUA THEM FULL CONSTRUCT O DUOI !!! )
    @Column(unique = true)
    private String citizenId;

    @Column
    private String citizenIdFrontImage;

    @Column
    private String citizenIdBackImage;

    @Column(nullable = false, columnDefinition = "TINYINT DEFAULT 0")
    private Integer verifiedAccount = 0;

    // CCCD END
    @Column(nullable = false, columnDefinition = "INT NOT NULL DEFAULT 0")
    private Integer score = 0;

    @Column(nullable = false, columnDefinition = "DATETIME DEFAULT CURRENT_TIMESTAMP")
    private LocalDateTime createdAt;

    @Column(columnDefinition = "DATETIME DEFAULT NULL")
    private LocalDateTime updatedAt;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean enable = false;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean verified = false;

    @Column
    private String verifiedResponse;

    @Column(nullable = false, columnDefinition = "BOOLEAN DEFAULT FALSE")
    private Boolean locked = false;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "user_roles", joinColumns = @JoinColumn(name = "user_id"))
    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private Set<Role> roles = new HashSet<>();

    public User() {}

    public User(Long id, String email, String firstName, String lastName, String password, String avatar,
                String avatarPublicId, String phoneNumber, String address,
                String citizenId, String citizenIdFrontImage, String citizenIdBackImage, Integer verifiedAccount,
                Integer score, LocalDateTime createdAt,
                LocalDateTime updatedAt, Boolean enable, Boolean verified,
                String verifiedResponse, Boolean locked, Set<Role> roles) {
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.password = password;
        this.avatar = avatar;
        this.avatarPublicId = avatarPublicId;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.citizenId = citizenId;
        this.citizenIdFrontImage = citizenIdFrontImage;
        this.citizenIdBackImage = citizenIdBackImage;
        this.verifiedAccount = verifiedAccount;
        this.score = score;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.enable = enable;
        this.verified = verified;
        this.verifiedResponse = verifiedResponse;
        this.locked = locked;
        this.roles = roles;
    }


    public Set<Role> getRoles() {
        return roles;
    }

    public void setRoles(Set<Role> roles) {
        this.roles = roles;
    }

    public void addRole(Role role) {
        if (this.roles == null) {
            this.roles = new HashSet<>();
        }
        this.roles.add(role);
    }

    public boolean hasRole(Role role) {
        return this.roles != null && this.roles.contains(role);
    }

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

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
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

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public Boolean getEnable() {
        return enable;
    }

    public void setEnable(Boolean enable) {
        this.enable = enable;
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

    public Integer getVerifiedAccount() {
        return verifiedAccount;
    }

    public void setVerifiedAccount(Integer verifiedAccount) {
        this.verifiedAccount = verifiedAccount;
    }
}
