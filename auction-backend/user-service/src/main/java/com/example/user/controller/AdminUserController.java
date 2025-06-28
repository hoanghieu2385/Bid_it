package com.example.user.controller;

import com.example.user.Dtos.UserCCCDVerifyDto;
import com.example.user.model.User;
import com.example.user.service.UserService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/admin")
public class AdminUserController {

    private final UserService userService;

    public AdminUserController(UserService userService) {
        this.userService = userService;
    }

    // Lấy danh sách các request verify
    @GetMapping("/verify-requests")
    public ResponseEntity<List<UserCCCDVerifyDto>> getVerifyRequests() {
        return ResponseEntity.ok(userService.getUsersPendingVerification());
    }

    // Duyệt CCCD
    @PostMapping("/verify-requests/{userId}/approve")
    public ResponseEntity<String> approveCCCD(@PathVariable Long userId) {
        userService.approveCitizenId(userId);
        return ResponseEntity.ok("User CCCD approved.");
    }

    // Từ chối CCCD
    @PostMapping("/verify-requests/{userId}/deny")
    public ResponseEntity<String> denyCCCD(@PathVariable Long userId) {
        userService.denyCitizenId(userId);
        return ResponseEntity.ok("User CCCD denied.");
    }
    @GetMapping("/{id}/verify-status")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> getVerificationStatus(@PathVariable Long id) {
        Optional<User> userOpt = userService.getUserById(id);
        if (userOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = userOpt.get();

        var response = new Object() {
            public final boolean phoneVerified = user.isPhoneVerified();
            public final String cccdStatus = user.getCitizenIdStatus().name();
            public final String citizenId = user.getCitizenId();
        };

        return ResponseEntity.ok(response);
    }

}
