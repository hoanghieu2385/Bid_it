package com.example.user.service;

public interface IUserService {
    boolean validateUser(String username, String password);
    boolean registerUser(String username, String password);
}