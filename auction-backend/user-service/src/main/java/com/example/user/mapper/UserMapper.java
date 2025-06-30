package com.example.user.mapper;

import com.example.user.Dtos.UserDTO;
import com.example.user.model.User;

import java.util.Set;
import java.util.stream.Collectors;

public class UserMapper {
    public static UserDTO toDTO(User user) {
        if (user == null) {
            return null;
        }

        Set<String> roleNames = user.getRoles() != null
                ? user.getRoles().stream().map(Enum::name).collect(Collectors.toSet())
                : null;

        return new UserDTO(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getScore(),
                user.getCitizenIdStatus() != null ? user.getCitizenIdStatus().name() : null,
                user.isPhoneVerified(), // hoặc user.getVerified() nếu bạn có field đó
                roleNames
        );
    }
}
