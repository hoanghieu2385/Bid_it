package com.example.payment.repository;

import com.example.payment.entity.Payment;
import com.example.payment.enums.PaymentStatus;
import com.example.payment.enums.PaymentType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {

    // Tìm payment theo external order ID (PayPal)
    Optional<Payment> findByExternalOrderId(String externalOrderId);

    // Tìm payment theo external transaction ID (PayPal)
    Optional<Payment> findByExternalTransactionId(String externalTransactionId);

    // Tìm tất cả payment của một user
    List<Payment> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Tìm tất cả payment của một auction
    List<Payment> findByAuctionIdOrderByCreatedAtDesc(Long auctionId);

    // Tìm payment theo user và auction
    List<Payment> findByUserIdAndAuctionIdOrderByCreatedAtDesc(Long userId, Long auctionId);

    // Tìm payment theo status
    List<Payment> findByStatusOrderByCreatedAtDesc(PaymentStatus status);

    // Tìm payment theo type
    List<Payment> findByPaymentTypeOrderByCreatedAtDesc(PaymentType paymentType);

    // Tìm auction payment của winner
    @Query("SELECT p FROM Payment p WHERE p.auctionId = :auctionId AND p.paymentType = 'AUCTION_PAYMENT' AND p.status = 'COMPLETED'")
    Optional<Payment> findCompletedAuctionPayment(@Param("auctionId") Long auctionId);

    // Tìm deposit payment của user cho auction
    @Query("SELECT p FROM Payment p WHERE p.userId = :userId AND p.auctionId = :auctionId AND p.paymentType = 'DEPOSIT' AND p.status = 'COMPLETED'")
    Optional<Payment> findUserDepositForAuction(@Param("userId") Long userId, @Param("auctionId") Long auctionId);

    // Tìm payment pending quá lâu (để cleanup)
    @Query("SELECT p FROM Payment p WHERE p.status = 'PENDING' AND p.createdAt < :cutoffTime")
    List<Payment> findPendingPaymentsOlderThan(@Param("cutoffTime") LocalDateTime cutoffTime);

    // Kiểm tra user đã thanh toán deposit cho auction chưa
    @Query("SELECT CASE WHEN COUNT(p) > 0 THEN true ELSE false END FROM Payment p WHERE p.userId = :userId AND p.auctionId = :auctionId AND p.paymentType = 'DEPOSIT' AND p.status = 'COMPLETED'")
    boolean hasUserPaidDepositForAuction(@Param("userId") Long userId, @Param("auctionId") Long auctionId);

    // Đếm số payment thành công của user
    @Query("SELECT COUNT(p) FROM Payment p WHERE p.userId = :userId AND p.status = 'COMPLETED'")
    long countCompletedPaymentsByUser(@Param("userId") Long userId);

    Optional<Payment> findByIdempotencyKey(String idempotencyKey);

    @Query("SELECT p FROM Payment p WHERE p.userId = :userId AND p.auctionId = :auctionId " +
            "AND p.paymentType = :paymentType AND p.status IN ('PENDING', 'COMPLETED') " +
            "ORDER BY p.createdAt DESC")
    Optional<Payment> findActivePaymentByUserAuctionType(@Param("userId") Long userId,
                                                         @Param("auctionId") Long auctionId,
                                                         @Param("paymentType") PaymentType paymentType);

}