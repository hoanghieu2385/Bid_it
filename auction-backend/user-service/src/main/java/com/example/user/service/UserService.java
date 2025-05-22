package com.example.user.service;

import com.example.user.Dtos.UpdateCCCDRequest;
import com.example.user.Dtos.UserCCCDVerifyDto;
import com.example.user.Dtos.UserUpdateRequest;
import com.example.user.model.OtpType;
import com.example.user.model.Role;
import com.example.user.model.User;
import com.example.user.repository.UserRepository;
import com.example.user.service.CloudinaryService;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final OtpService otpService;


    public UserService(UserRepository userRepository, CloudinaryService cloudinaryService, OtpService otpService) {
        this.userRepository = userRepository;
        this.cloudinaryService = cloudinaryService;
        this.otpService = otpService;
    }

    
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


    // CCCD!!!
    public User updateCCCD(String email, UpdateCCCDRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setCitizenId(request.getCitizenId());
        user.setCitizenIdFrontImage(request.getCitizenIdFrontImage());
        user.setCitizenIdBackImage(request.getCitizenIdBackImage());
        user.setVerifiedAccount(0); // chờ admin duyệt
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }
    public void updateCCCDWithImages(String email, String citizenId, MultipartFile frontImage, MultipartFile backImage) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String frontUrl = cloudinaryService.uploadImage(frontImage);
        String backUrl = cloudinaryService.uploadImage(backImage);

        user.setCitizenId(citizenId);
        user.setCitizenIdFrontImage(frontUrl);
        user.setCitizenIdBackImage(backUrl);
        user.setVerifiedAccount(0); // reset verify trạng thái

        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }


    // Verify Phone Number
    public boolean verifyUserPhoneNumber(String phoneNumber, String code) {
        boolean isValid = otpService.verifyOtp(phoneNumber, code, OtpType.PHONE_VERIFICATION);
        if (isValid) {
            Optional<User> optionalUser = userRepository.findByPhoneNumber(phoneNumber);
            if (optionalUser.isPresent()) {
                User user = optionalUser.get();
                user.setPhoneVerified(true);
                userRepository.save(user);
                return true;
            }
        }
        return false;
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
    public void saveUser(User user) {
        userRepository.save(user);
    }
    public List<UserCCCDVerifyDto> getUsersPendingVerification() {
        return userRepository.findByVerifiedAccount(0)
                .stream()
                .map(user -> new UserCCCDVerifyDto(
                        user.getId(),
                        user.getEmail(),
                        user.getFirstName() + " " + user.getLastName(),
                        user.getCitizenId(),
                        user.getCitizenIdFrontImage(),
                        user.getCitizenIdBackImage()
                ))
                .toList();
    }


}