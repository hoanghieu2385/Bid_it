package com.example.user.service;

import com.example.user.model.User;
import com.example.user.repository.IUserRepository;
import org.springframework.stereotype.Service;

@Service
public class UserService implements IUserService {

    private final IUserRepository userRepository;

    public UserService(IUserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public boolean validateUser(String username, String password) {
        User user = userRepository.findByUsernameAndPassword(username, password);
        return user != null;
    }

    @Override
    public boolean registerUser(String username, String password) {
        User existingUser = userRepository.findByUsername(username);
        if (existingUser != null) {
            return false;
        }

        User newUser = new User();
        newUser.setUsername(username);
        newUser.setPassword(password);
        userRepository.save(newUser);
        return true;
    }
}