package com.example.user.repository;

import com.example.user.model.ScoreHistory;
import com.example.user.model.ScoreChangeType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ScoreHistoryRepository extends JpaRepository<ScoreHistory, Long> {

    // Lấy lịch sử theo user ID
    Page<ScoreHistory> findByUserIdOrderByCreatedAtDesc(Long userId, Pageable pageable);

    // Lấy lịch sử theo user ID và loại thay đổi
    List<ScoreHistory> findByUserIdAndChangeTypeOrderByCreatedAtDesc(Long userId, ScoreChangeType changeType);

    // Lấy lịch sử trong khoảng thời gian
    List<ScoreHistory> findByUserIdAndCreatedAtBetweenOrderByCreatedAtDesc(
            Long userId, LocalDateTime startDate, LocalDateTime endDate);

    // Tính tổng điểm thay đổi theo loại
    @Query("SELECT SUM(sh.changeAmount) FROM ScoreHistory sh WHERE sh.userId = :userId AND sh.changeType = :changeType")
    Integer sumChangeAmountByUserIdAndChangeType(Long userId, ScoreChangeType changeType);

    // Lấy 10 giao dịch gần nhất
    List<ScoreHistory> findTop10ByUserIdOrderByCreatedAtDesc(Long userId);
}