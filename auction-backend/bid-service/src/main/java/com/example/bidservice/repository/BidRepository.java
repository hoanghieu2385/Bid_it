package com.example.bidservice.repository;

import com.example.bidservice.entity.Bid;
import com.example.bidservice.entity.BidStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface BidRepository extends JpaRepository<Bid, Long> {

    // Lấy tất cả bid của một auction theo thứ tự giảm dần
    List<Bid> findByAuctionIdOrderByBidAmountDesc(Long auctionId);

    // Lấy bid cao nhất của một auction
    @Query("SELECT b FROM Bid b WHERE b.auctionId = :auctionId AND b.bidAmount = " +
            "(SELECT MAX(b2.bidAmount) FROM Bid b2 WHERE b2.auctionId = :auctionId)")
    Optional<Bid> findHighestBidByAuctionId(@Param("auctionId") Long auctionId);

    // Lấy số tiền bid cao nhất của một auction
    @Query("SELECT MAX(b.bidAmount) FROM Bid b WHERE b.auctionId = :auctionId")
    Optional<BigDecimal> findMaxBidAmountByAuctionId(@Param("auctionId") Long auctionId);

    // Lấy tất cả bid của một user
    List<Bid> findByUserIdOrderByCreatedAtDesc(Long userId);

    // Lấy bid của user trong một auction cụ thể
    List<Bid> findByAuctionIdAndUserIdOrderByCreatedAtDesc(Long auctionId, Long userId);

    List<Bid> findByAuctionId(Long auctionId);

    // Đếm số lượng bid trong một auction
    long countByAuctionId(Long auctionId);

    // Kiểm tra user đã bid trong auction chưa
    boolean existsByAuctionIdAndUserId(Long auctionId, Long userId);

    // Lấy lịch sử bid của auction (toàn bộ bid history) - UPDATED
    @Query("SELECT b FROM Bid b WHERE b.auctionId = :auctionId ORDER BY b.createdAt DESC")
    List<Bid> findBidHistoryByAuctionId(@Param("auctionId") Long auctionId);

    // Lấy danh sách auction IDs có bid
    @Query("SELECT DISTINCT b.auctionId FROM Bid b")
    List<Long> findDistinctAuctionIds();

    // Tìm tất cả bid của auction (trừ bid có ID cụ thể)
    List<Bid> findByAuctionIdAndIdNot(Long auctionId, Long excludeId);
}