package com.example.user.mapper;

import com.example.user.Dtos.UserDTO;
import com.example.user.model.User;

public class UserMapper {
    public static UserDTO toDTO(User user) {
        return new UserDTO(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getScore()
        );
    }
}
