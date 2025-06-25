package com.example.user.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "score_history")
public class ScoreHistory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "change_amount", nullable = false)
    private Integer changeAmount; // Số điểm thay đổi (+/-)

    @Column(name = "previous_score", nullable = false)
    private Integer previousScore; // Điểm trước khi thay đổi

    @Column(name = "new_score", nullable = false)
    private Integer newScore; // Điểm sau khi thay đổi

    @Enumerated(EnumType.STRING)
    @Column(name = "change_type", nullable = false)
    private ScoreChangeType changeType;

    @Column(name = "reason")
    private String reason; // Lý do thay đổi

    @Column(name = "reference_id")
    private Long referenceId; // ID liên quan (auction_id, bid_id, etc.)

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }

    // Constructors
    public ScoreHistory() {}

    public ScoreHistory(Long userId, Integer changeAmount, Integer previousScore,
                        Integer newScore, ScoreChangeType changeType, String reason, Long referenceId) {
        this.userId = userId;
        this.changeAmount = changeAmount;
        this.previousScore = previousScore;
        this.newScore = newScore;
        this.changeType = changeType;
        this.reason = reason;
        this.referenceId = referenceId;
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
    public void setChangeType(ScoreChangeType changeType) { this.changeType = changeType; }

    public String getReason() { return reason; }
    public void setReason(String reason) { this.reason = reason; }

    public Long getReferenceId() { return referenceId; }
    public void setReferenceId(Long referenceId) { this.referenceId = referenceId; }

    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
}