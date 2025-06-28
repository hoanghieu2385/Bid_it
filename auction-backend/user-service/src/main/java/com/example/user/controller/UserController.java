// UserController.java
package com.example.user.controller;

import com.example.user.Dtos.*;
import com.example.user.model.OtpType;
import com.example.user.model.User;
import com.example.user.service.UserService;
import com.example.user.service.OtpService;
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

    @GetMapping("/seller/{id}")
    public ResponseEntity<?> getSellerById(@PathVariable Long id) {
        Optional<User> userOpt = userService.getSellerById(id);
        if (userOpt.isEmpty()) return ResponseEntity.notFound().build();

        User user = userOpt.get();

        var response = new Object() {
            public final Long id = user.getId();
            public final String fullName = user.getFirstName() + " " + user.getLastName();
            public final String address = user.getAddress();
            public final int score = user.getScore();
        };

        return ResponseEntity.ok(response);
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

    @GetMapping("/me/verify-status")
    public ResponseEntity<VerificationStatusResponse> getMyVerificationStatus() {
        User user = userService.getCurrentUserProfile();

        String phoneStatus = user.isPhoneVerified() ? "VERIFIED" : "UNVERIFIED";

        String cccdStatus = switch (user.getCitizenIdStatus()) {
            case NONE -> "NOT_SUBMITTED";
            case PENDING -> "PENDING";
            case APPROVED -> "APPROVED";
            case DENIED -> "REJECTED";
        };

        VerificationStatusResponse response = new VerificationStatusResponse(
                user.isPhoneVerified(),
                phoneStatus,
                user.getCitizenId(),
                cccdStatus
        );

        return ResponseEntity.ok(response);
    }

    @PostMapping("/send-phone-otp")
    public ResponseEntity<String> sendPhoneOtp(@RequestParam String phone) {
        otpService.sendPhoneVerificationOtp(phone);
        return ResponseEntity.ok("OTP sent to phone.");
    }

    @PostMapping("/verify-phone-otp")
    public ResponseEntity<String> verifyPhoneOtp(@RequestBody VerifyPhoneOtpRequest request, Principal principal) {
        boolean result = userService.verifyUserPhoneNumberForCurrentUser(request.getPhone(), request.getOtp(), principal);
        if (result) return ResponseEntity.ok("Phone number verified successfully");
        return ResponseEntity.badRequest().body("Invalid or expired OTP");
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
