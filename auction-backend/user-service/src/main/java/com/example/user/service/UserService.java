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
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
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
        if (!isAdmin()) {
            throw new AccessDeniedException("Only administrators can access all user data");
        }
        return userRepository.findAll();
    }

    public Optional<User> getUserById(Long id) {
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

    public Optional<User> getSellerById(Long id) {
        return userRepository.findById(id);
    }

    public User createUser(User user) {
        if (!isAdmin()) {
            throw new AccessDeniedException("Only administrators can create users");
        }

        if (user.getRoles() == null || user.getRoles().isEmpty()) {
            Set<Role> roles = new HashSet<>();
            roles.add(Role.USER);
            user.setRoles(roles);
        }

        return userRepository.save(user);
    }

    public void deleteUser(Long id) {
        if (!isAdmin()) {
            throw new AccessDeniedException("Only administrators can delete users");
        }
        userRepository.deleteById(id);
    }

    public User updateUserProfile(Long userId, UserUpdateRequest updateRequest) {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!user.getEmail().equals(currentUserEmail) && !isAdmin()) {
            throw new AccessDeniedException("You can only update your own profile");
        }

        if (updateRequest.getFirstName() != null && !updateRequest.getFirstName().isEmpty()) {
            user.setFirstName(updateRequest.getFirstName());
        }

        if (updateRequest.getLastName() != null && !updateRequest.getLastName().isEmpty()) {
            user.setLastName(updateRequest.getLastName());
        }

        if (updateRequest.getPhoneNumber() != null && !updateRequest.getPhoneNumber().isEmpty()) {
            Optional<User> existingUserWithPhone = userRepository.findByPhoneNumber(updateRequest.getPhoneNumber());
            if (existingUserWithPhone.isPresent() && !existingUserWithPhone.get().getId().equals(userId)) {
                throw new RuntimeException("Phone number already in use");
            }
            user.setPhoneNumber(updateRequest.getPhoneNumber());
        }

        if (updateRequest.getAddress() != null && !updateRequest.getAddress().isEmpty()) {
            user.setAddress(updateRequest.getAddress());
        }

        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    public User updateCCCD(String email, UpdateCCCDRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setCitizenId(request.getCitizenId());
        user.setCitizenIdFrontImage(request.getCitizenIdFrontImage());
        user.setCitizenIdBackImage(request.getCitizenIdBackImage());
        user.setVerifiedAccount(0);
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
        user.setVerifiedAccount(0);
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    public boolean verifyUserPhoneNumberForCurrentUser(String phone, String otp, Principal principal) {
        boolean isValid = otpService.verifyOtp(phone, otp, OtpType.PHONE_VERIFICATION);
        if (isValid) {
            User user = userRepository.findByEmail(principal.getName())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));
            user.setPhoneNumber(phone);
            user.setPhoneVerified(true);
            userRepository.save(user);
            return true;
        }
        return false;
    }

    public User getCurrentUserProfile() {
        String currentUserEmail = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByEmail(currentUserEmail)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

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
