package com.example.auction.dto;

public class UserDTO {

    private Long id;
    private String email;
    private String firstName;
    private String lastName;
    private String avatar;
    private String avatarPublicId;
    private String phoneNumber;
    private String address;

    // Need to change this to PayPal number
    private String bankAccountNumber;

    private Integer score;
    private Boolean verified;
    private String verifiedResponse;
    private Boolean locked;
}
