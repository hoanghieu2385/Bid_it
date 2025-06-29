package com.example.user.controller;

import com.example.user.Dtos.ScoreHistoryDTO;
import com.example.user.Dtos.UserDTO;
import com.example.user.mapper.UserMapper;
import com.example.user.model.User;
import com.example.user.service.UserService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/internal/users")
public class InternalUserController {

    private static final Logger logger = LoggerFactory.getLogger(InternalUserController.class);

    private final UserService userService;

    public InternalUserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getUserById(@PathVariable Long id) {
        logger.info("🔍 [getUserById] Start - id={}", id);
        try {
            Optional<User> userOpt = userService.getUserByIdInternal(id);

            if (userOpt.isEmpty()) {
                logger.warn("⚠️ [getUserById] User not found: id={}", id);
                return ResponseEntity.notFound().build();
            }

            User user = userOpt.get();
            logger.info("✅ [getUserById] Found user: id={}, email={}", user.getId(), user.getEmail());

            UserDTO dto = UserMapper.toDTO(user);
            logger.info("✅ [getUserById] Mapped DTO: id={}, email={}, score={}",
                    dto.getId(), dto.getEmail(), dto.getScore());

            return ResponseEntity.ok(dto);

        } catch (Exception e) {
            logger.error("💥 [getUserById] Exception: ", e);
            return ResponseEntity.internalServerError().body("Server Error: " + e.getMessage());
        }
    }

    @GetMapping("/{id}/score")
    public ResponseEntity<Integer> getUserScore(@PathVariable Long id) {
        logger.info("Fetching score for user id={}", id);
        Optional<User> user = userService.getUserById(id);
        return user.map(u -> {
            logger.info("User score: {}", u.getScore());
            return ResponseEntity.ok(u.getScore());
        }).orElseGet(() -> {
            logger.warn("User not found when fetching score: id={}", id);
            return ResponseEntity.notFound().build();
        });
    }

    @PutMapping("/{id}/deduct-score")
    public ResponseEntity<Void> deductScore(
            @PathVariable Long id,
            @RequestParam("amount") int amount
    ) {
        logger.info("Deducting {} points from user id={}", amount, id);
        userService.deductScore(id, amount);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}/add-score")
    public ResponseEntity<Void> addScore(
            @PathVariable Long id,
            @RequestParam("amount") int amount,
            @RequestParam(value = "reason", required = false) String reason,
            @RequestParam(value = "referenceId", required = false) Long referenceId
    ) {
        logger.info("Adding {} points to user id={}, reason={}, referenceId={}", amount, id, reason, referenceId);
        userService.addScore(id, amount, reason, referenceId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/score-history")
    public ResponseEntity<Page<ScoreHistoryDTO>> getScoreHistory(
            @PathVariable Long id,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        logger.info("Fetching score history for user id={}, page={}, size={}", id, page, size);
        Pageable pageable = PageRequest.of(page, size);
        Page<ScoreHistoryDTO> history = userService.getScoreHistory(id, pageable);
        logger.info("Fetched {} score history entries", history.getNumberOfElements());
        return ResponseEntity.ok(history);
    }

    @GetMapping("/{id}/score-history/recent")
    public ResponseEntity<List<ScoreHistoryDTO>> getRecentScoreHistory(@PathVariable Long id) {
        logger.info("Fetching recent score history for user id={}", id);
        List<ScoreHistoryDTO> history = userService.getRecentScoreHistory(id);
        logger.info("Fetched {} recent history records", history.size());
        return ResponseEntity.ok(history);
    }
}
