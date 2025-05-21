package com.example.user.controller;

import com.example.user.Dtos.RoleUpdateRequest;
import com.example.user.Dtos.UserCCCDVerifyDto;
import com.example.user.Dtos.UserUpdateRequest;
import com.example.user.Dtos.UpdateCCCDRequest;
import com.example.user.model.OtpType;
import com.example.user.model.User;
import com.example.user.service.UserService;
import com.example.user.service.OtpService;
import com.example.user.repository.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/users")
public class UserController {

    private final UserService userService;
    private final OtpService otpService;

    public UserController(UserService userService, OtpService otpService) {
        this.userService = userService;
        this.otpService = otpService;
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
    // VERIFY CCCD !!!
    @PutMapping("/update-cccd")
    public ResponseEntity<?> updateCCCD(
            @RequestParam("citizenId") String citizenId,
            @RequestParam("frontImage") MultipartFile frontImage,
            @RequestParam("backImage") MultipartFile backImage,
            Principal principal) {
        try {
            userService.updateCCCDWithImages(principal.getName(), citizenId, frontImage, backImage);
            return ResponseEntity.ok("CCCD info uploaded. Awaiting admin verification.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Failed to upload CCCD: " + e.getMessage());
        }
    }
    @GetMapping("/verify-requests")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<UserCCCDVerifyDto>> getVerifyRequests() {
        return ResponseEntity.ok(userService.getUsersPendingVerification());
    }


    @PostMapping("/{id}/verify/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveCCCD(@PathVariable Long id) {
        Optional<User> userOpt = userService.getUserById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        user.setVerifiedAccount(1);
        user.setUpdatedAt(LocalDateTime.now());
        userService.saveUser(user); // hoặc userRepository.save(user) nếu bạn muốn nhanh
        return ResponseEntity.ok("User CCCD approved");
    }

    @PostMapping("/{id}/verify/deny")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> denyCCCD(@PathVariable Long id) {
        Optional<User> userOpt = userService.getUserById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();
        user.setCitizenId(null);
        user.setCitizenIdFrontImage(null);
        user.setCitizenIdBackImage(null);
        user.setVerifiedAccount(0);
        user.setUpdatedAt(LocalDateTime.now());
        userService.saveUser(user);
        return ResponseEntity.ok("User CCCD denied and data cleared");
    }


    ///  Verify Phone Number
    @PostMapping("/send-phone-otp")
    public ResponseEntity<String> sendPhoneOtp(@RequestParam String phone) {
        otpService.sendPhoneVerificationOtp(phone);
        return ResponseEntity.ok("OTP sent to phone.");
    }

    @PostMapping("/verify-phone-otp")
    public ResponseEntity<String> verifyPhoneOtp(@RequestParam String phone,
                                                 @RequestParam String otp) {
        boolean verified = userService.verifyUserPhoneNumber(phone, otp);
        return verified
                ? ResponseEntity.ok("Phone verified.")
                : ResponseEntity.badRequest().body("Invalid or expired OTP.");
    }


    ///

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