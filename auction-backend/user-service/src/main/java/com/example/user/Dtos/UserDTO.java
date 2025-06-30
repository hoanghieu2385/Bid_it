package com.example.user.Dtos;

import java.util.Set;

public class UserDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private Integer score;
    private String citizenIdStatus;
    private Boolean verified;
    private Set<String> roles;

    public UserDTO() {
    }

    public UserDTO(Long id, String firstName, String lastName, String email, Integer score,
                   String citizenIdStatus, Boolean verified, Set<String> roles) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.score = score;
        this.citizenIdStatus = citizenIdStatus;
        this.verified = verified;
        this.roles = roles;
    }

    // Getter và Setter đầy đủ

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Integer getScore() {
        return score;
    }

    public void setScore(Integer score) {
        this.score = score;
    }

    public String getCitizenIdStatus() {
        return citizenIdStatus;
    }

    public void setCitizenIdStatus(String citizenIdStatus) {
        this.citizenIdStatus = citizenIdStatus;
    }

    public Boolean getVerified() {
        return verified;
    }

    public void setVerified(Boolean verified) {
        this.verified = verified;
    }

    public Set<String> getRoles() {
        return roles;
    }

    public void setRoles(Set<String> roles) {
        this.roles = roles;
    }
}
