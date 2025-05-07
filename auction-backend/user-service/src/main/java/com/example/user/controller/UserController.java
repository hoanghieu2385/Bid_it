package com.example.user.controller;

import com.example.user.Dtos.RoleUpdateRequest;
import com.example.user.Dtos.UserUpdateRequest;
import com.example.user.model.User;
import com.example.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;

    // Constructor thay thế cho @RequiredArgsConstructor
    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> getUserById(@PathVariable Long id) {
        Optional<User> user = userService.getUserById(id);
        return user.map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<User> createUser(@RequestBody User user) {
        return ResponseEntity.ok(userService.createUser(user));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id) {
        userService.deleteUser(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/profile")
    public ResponseEntity<?> updateUserProfile(
            @PathVariable Long id,
            @RequestBody UserUpdateRequest updateRequest) {
        try {
            User updatedUser = userService.updateUserProfile(id, updateRequest);
            return ResponseEntity.ok(updatedUser);
        } catch (RuntimeException e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body("An error occurred: " + e.getMessage());
        }
    }

    @GetMapping("/me")
    public ResponseEntity<User> getCurrentUserProfile() {
        try {
            User currentUser = userService.getCurrentUserProfile();
            return ResponseEntity.ok(currentUser);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }

    // New endpoint to update user roles (admin only)
    @PutMapping("/{id}/roles")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateUserRoles(
            @PathVariable Long id,
            @RequestBody RoleUpdateRequest request) {
        try {
            User updatedUser = userService.updateUserRoles(id, request.getRoles());
            return ResponseEntity.ok(updatedUser);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }
}