package com.example.user.Dtos;

import com.example.user.model.ScoreChangeType;
import java.time.LocalDateTime;

public class ScoreHistoryDTO {
    private Long id;
    private Long userId;
    private Integer changeAmount;
    private Integer previousScore;
    private Integer newScore;
    private ScoreChangeType changeType;
    private String changeTypeDescription;
    private String reason;
    private Long referenceId;
    private LocalDateTime createdAt;

    // Constructors
    public ScoreHistoryDTO() {}

    public ScoreHistoryDTO(Long id, Long userId, Integer changeAmount, Integer previousScore,
                           Integer newScore, ScoreChangeType changeType, String reason,
                           Long referenceId, LocalDateTime createdAt) {
        this.id = id;
        this.userId = userId;
        this.changeAmount = changeAmount;
        this.previousScore = previousScore;
        this.newScore = newScore;
        this.changeType = changeType;
        this.changeTypeDescription = changeType != null ? changeType.getDescription() : null;
        this.reason = reason;
        this.referenceId = referenceId;
        this.createdAt = createdAt;
    }

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }

    public Integer getChangeAmount() { return changeAmount; }
    public void setChangeAmount(Integer changeAmount) { this.changeAmount = changeAmount; }

    public Integer getPreviousScore() { return previousScore; }
    public void setPreviousScore(Integer previousScore) { this.previousScore = previousScore; }

    public Integer getNewScore() { return newScore; }
    public void setNewScore(Integer newScore) { this.newScore = newScore; }

    public ScoreChangeType getChangeType() { return changeType; }
    public void setChangeType(ScoreChangeType changeType) {
        this.changeType = changeType;
        this.changeTypeDescription = changeType != null ? changeType.getDescription() : null;
    }

    public String getChangeTypeDescription() { return changeTypeDescription; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}