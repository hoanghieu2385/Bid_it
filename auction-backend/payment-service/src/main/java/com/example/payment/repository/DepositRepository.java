package com.example.payment.repository;

import com.example.payment.entity.Deposit;
import com.example.payment.enums.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

/**
 * Repository cho Deposit entity (dự phòng cho tương lai)
 */
@Repository
public interface DepositRepository extends JpaRepository<Deposit, Long> {

    // Tìm deposit của user cho auction
    Optional<Deposit> findByUserIdAndAuctionId(Long userId, Long auctionId);

    // Tìm tất cả deposit của user
    List<Deposit> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Tìm tất cả deposit của auction
    List<Deposit> findByAuctionIdOrderByCreatedAtDesc(Long auctionId);

    // Tìm deposit theo status
    List<Deposit> findByStatusOrderByCreatedAtDesc(PaymentStatus status);

    // Tìm deposit theo payment ID
    Optional<Deposit> findByPaymentId(Long paymentId);

    // Tìm tất cả deposit chưa hoàn tiền cho auction (để hoàn tiền cho người thua)
    @Query("SELECT d FROM Deposit d WHERE d.auctionId = :auctionId AND d.isRefunded = false AND d.status = 'COMPLETED'")
    List<Deposit> findUnrefundedDepositsForAuction(@Param("auctionId") Long auctionId);

    // Tìm deposit của winner cho auction (để trừ vào thanh toán cuối)
    @Query("SELECT d FROM Deposit d WHERE d.userId = :winnerId AND d.auctionId = :auctionId AND d.isRefunded = false AND d.status = 'COMPLETED'")
    Optional<Deposit> findWinnerDepositForAuction(@Param("winnerId") Long winnerId, @Param("auctionId") Long auctionId);

    // Đếm số deposit đã thanh toán của user
    @Query("SELECT COUNT(d) FROM Deposit d WHERE d.userId = :userId AND d.status = 'COMPLETED'")
    long countCompletedDepositsByUser(@Param("userId") Long userId);

    // Kiểm tra user đã có deposit cho auction chưa
    @Query("SELECT CASE WHEN COUNT(d) > 0 THEN true ELSE false END FROM Deposit d WHERE d.userId = :userId AND d.auctionId = :auctionId AND d.status = 'COMPLETED'")
    boolean hasUserDepositForAuction(@Param("userId") Long userId, @Param("auctionId") Long auctionId);
}