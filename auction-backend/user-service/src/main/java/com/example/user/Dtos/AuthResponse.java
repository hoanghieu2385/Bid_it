package com.example.user.Dtos;

import java.util.List;

public class AuthResponse {
    private String token;
    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private String address;
    private Integer score;
    private List<String> roles; // 🆕

    public AuthResponse() {
    }

    public AuthResponse(String token) {
        this.token = token;
    }

    public AuthResponse(String token, Long id, String email, String firstName, String lastName,
                        String phoneNumber, String address, Integer score) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.score = score;
    }

    // 🆕 Constructor đầy đủ có roles
    public AuthResponse(String token, Long id, String email, String firstName, String lastName,
                        String phoneNumber, String address, Integer score, List<String> roles) {
        this.token = token;
        this.id = id;
        this.email = email;
        this.firstName = firstName;
        this.lastName = lastName;
        this.phoneNumber = phoneNumber;
        this.address = address;
        this.score = score;
        this.roles = roles;
    }

    // Getters & setters
    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
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

    public List<String> getRoles() {
        return roles;
    }

    public void setRoles(List<String> roles) {
        this.roles = roles;
    }
}
