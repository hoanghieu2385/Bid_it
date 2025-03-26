package com.example.user.controller;

import com.example.user.service.IUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "*")
@RestController
@RequestMapping("/api")
public class UserController {

    private final IUserService userService;

    public UserController(IUserService userService) {
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestParam String username, @RequestParam String password) {
        boolean isValid = userService.validateUser(username, password);
        if (isValid) {
            return ResponseEntity.ok("Login successful!");
        } else {
            return ResponseEntity.status(401).body("Invalid username or password");
        }
    }
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestParam String username, @RequestParam String password) {
        boolean isRegistered = userService.registerUser(username, password);
        if (isRegistered) {
            return ResponseEntity.ok("Registration successful!");
        } else {
            return ResponseEntity.status(400).body("Username already exists");
        }
    }
}