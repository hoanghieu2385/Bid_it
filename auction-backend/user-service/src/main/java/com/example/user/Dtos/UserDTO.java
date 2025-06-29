package com.example.user.Dtos;

public class UserDTO {
    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private Integer score;

    public UserDTO() {
    }

    public UserDTO(Long id, String firstName, String lastName, String email, Integer score) {
        this.id = id;
        this.firstName = firstName;
        this.lastName = lastName;
        this.email = email;
        this.score = score;
    }

    // Getter Setter đầy đủ

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
}
