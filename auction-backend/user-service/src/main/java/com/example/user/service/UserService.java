package com.example.user.service;

import com.example.user.Dtos.ScoreHistoryDTO;
import com.example.user.Dtos.UpdateCCCDRequest;
import com.example.user.Dtos.UserCCCDVerifyDto;
import com.example.user.Dtos.UserUpdateRequest;
import com.example.user.model.*;
import com.example.user.repository.ScoreHistoryRepository;
import com.example.user.repository.UserRepository;
import com.example.user.service.CloudinaryService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.security.Principal;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class UserService {
    private final UserRepository userRepository;
    private final CloudinaryService cloudinaryService;
    private final OtpService otpService;
    private final ScoreHistoryRepository scoreHistoryRepository;

    public UserService(UserRepository userRepository, CloudinaryService cloudinaryService, OtpService otpService, ScoreHistoryRepository scoreHistoryRepository) {
        this.userRepository = userRepository;
        this.cloudinaryService = cloudinaryService;
        this.otpService = otpService;
        this.scoreHistoryRepository = scoreHistoryRepository;
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
        user.setCitizenIdStatus(CitizenIdStatus.PENDING);

        user.setUpdatedAt(LocalDateTime.now());
        return userRepository.save(user);
    }

    //Admin duyet
    public void approveCitizenId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setCitizenIdStatus(CitizenIdStatus.APPROVED);
        userRepository.save(user);
    }
    public void denyCitizenId(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));

        user.setCitizenIdStatus(CitizenIdStatus.DENIED);
        userRepository.save(user);
    }
    //

    public void updateCCCDWithImages(String email, String citizenId, MultipartFile frontImage, MultipartFile backImage) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        String frontUrl = cloudinaryService.uploadImage(frontImage);
        String backUrl = cloudinaryService.uploadImage(backImage);

        user.setCitizenId(citizenId);
        user.setCitizenIdFrontImage(frontUrl);
        user.setCitizenIdBackImage(backUrl);
        user.setCitizenIdStatus(CitizenIdStatus.PENDING); // ⚠️ Đổi trạng thái sang PENDING
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
        return userRepository.findByCitizenIdStatus(CitizenIdStatus.PENDING)
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


    @Transactional
    public void deductScore(Long userId, int amount) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        int previousScore = user.getScore();
        int newScore = Math.max(0, previousScore - amount); // Không cho điểm âm

        user.setScore(newScore);
        userRepository.save(user);

        // Lưu lịch sử
        ScoreHistory history = new ScoreHistory(
                userId, -amount, previousScore, newScore,
                ScoreChangeType.PENALTY,
                "Penalties for failure to pay on time",
                null
        );
        scoreHistoryRepository.save(history);
    }

    @Transactional
    public void addScore(Long userId, int amount, String reason, Long referenceId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        int previousScore = user.getScore();
        int newScore = previousScore + amount;

        user.setScore(newScore);
        userRepository.save(user);

        // Lưu lịch sử
        ScoreHistory history = new ScoreHistory(
                userId, amount, previousScore, newScore,
                ScoreChangeType.REWARD, reason, referenceId
        );
        scoreHistoryRepository.save(history);
    }

    @Transactional
    public void adjustScore(Long userId, int newScore, String reason) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        int previousScore = user.getScore();
        int changeAmount = newScore - previousScore;

        user.setScore(newScore);
        userRepository.save(user);

        // Lưu lịch sử
        ScoreHistory history = new ScoreHistory(
                userId, changeAmount, previousScore, newScore,
                ScoreChangeType.ADJUSTMENT, reason, null
        );
        scoreHistoryRepository.save(history);
    }

    // Lấy lịch sử điểm
    public Page<ScoreHistoryDTO> getScoreHistory(Long userId, Pageable pageable) {
        Page<ScoreHistory> histories = scoreHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId, pageable);
        return histories.map(this::convertToDTO);
    }

    public List<ScoreHistoryDTO> getRecentScoreHistory(Long userId) {
        List<ScoreHistory> histories = scoreHistoryRepository.findTop10ByUserIdOrderByCreatedAtDesc(userId);
        return histories.stream().map(this::convertToDTO).collect(Collectors.toList());
    }

    private ScoreHistoryDTO convertToDTO(ScoreHistory history) {
        return new ScoreHistoryDTO(
                history.getId(),
                history.getUserId(),
                history.getChangeAmount(),
                history.getPreviousScore(),
                history.getNewScore(),
                history.getChangeType(),
                history.getReason(),
                history.getReferenceId(),
                history.getCreatedAt()
        );
    }
}
