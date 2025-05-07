package com.example.user.service;

import com.example.user.Dtos.UserUpdateRequest;
import com.example.user.model.Role;
import com.example.user.model.User;
import com.example.user.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class UserService {
    private final UserRepository userRepository;

    // Constructor manually created to replace @RequiredArgsConstructor
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    // Method to check if current user is an admin
    private boolean isAdmin() {
        return SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().contains(new SimpleGrantedAuthority("ROLE_ADMIN"));
    }

    public List<User> getAllUsers() {
        // Only admins can get all users
        if (!isAdmin()) {
            throw new AccessDeniedException("Only administrators can access all user data");
        }
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
        // Check if user is requesting their own data or is an admin
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        Optional<User> requestedUser = userRepository.findById(id);

        if (requestedUser.isPresent()) {
            User user = requestedUser.get();
            if (user.getEmail().equals(currentUserEmail) || isAdmin()) {
                return requestedUser;
            } else {
                throw new AccessDeniedException("You can only access your own profile");
            }
        }

        return Optional.empty();
    }

    public User createUser(User user) {
        // Only admins can create users
        if (!isAdmin()) {
            throw new AccessDeniedException("Only administrators can create users");
        }

        // Set default role if not specified
        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            Set<Role> roles = new HashSet<>();
            roles.add(Role.USER);
            user.setRoles(roles);
        }

        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        // Only admins can delete users
        if (!isAdmin()) {
            throw new AccessDeniedException("Only administrators can delete users");
        }
        userRepository.deleteById(id);
    }

    public User updateUserProfile(Long userId, UserUpdateRequest updateRequest) {
        // Get the email of the currently authenticated user
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();

        // Find the user by ID
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Check if the authenticated user is trying to update their own profile or is an admin
        if (!user.getEmail().equals(currentUserEmail) && !isAdmin()) {
            throw new AccessDeniedException("You can only update your own profile");
        }

        // Update user information
        if (updateRequest.getFirstName() != null && !updateRequest.getFirstName().isEmpty()) {
            user.setFirstName(updateRequest.getFirstName());
        }

        if (updateRequest.getLastName() != null && !updateRequest.getLastName().isEmpty()) {
            user.setLastName(updateRequest.getLastName());
        }

        if (updateRequest.getPhoneNumber() != null && !updateRequest.getPhoneNumber().isEmpty()) {
            // Check if the phone number is already used by another user
            Optional<User> existingUserWithPhone = userRepository.findByPhoneNumber(updateRequest.getPhoneNumber());
            if (existingUserWithPhone.isPresent() && !existingUserWithPhone.get().getId().equals(userId)) {
                throw new RuntimeException("Phone number already in use");
            }
            user.setPhoneNumber(updateRequest.getPhoneNumber());
        }

        if (updateRequest.getAddress() != null && !updateRequest.getAddress().isEmpty()) {
            user.setAddress(updateRequest.getAddress());
        }

        // Update the updatedAt timestamp
        user.setUpdatedAt(LocalDateTime.now());

        // Save and return the updated user
        return userRepository.save(user);
    }

    // Get currently logged-in user's profile
    public User getCurrentUserProfile() {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    // Add method to change user role (admin only)
    public User updateUserRoles(Long userId, Set<Role> roles) {
        if (!isAdmin()) {
            throw new AccessDeniedException("Only administrators can update user roles");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setRoles(roles);
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }
}