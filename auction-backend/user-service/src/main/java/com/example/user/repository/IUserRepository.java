package com.example.user.repository;

import com.example.user.model.User;
import org.springframework.data.jpa.repository.JpaRepository;

public interface IUserRepository extends JpaRepository<User, Integer> {
    User findByUsernameAndPassword(String username, String password);
    User findByUsername(String username);
}