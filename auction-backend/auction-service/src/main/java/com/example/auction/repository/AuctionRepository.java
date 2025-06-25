package com.example.auction.repository;

import com.example.auction.model.Auction;
import com.example.auction.model.AuctionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuctionRepository extends JpaRepository<Auction, Long> {

    List<Auction> findByStatus(AuctionStatus status);

    List<Auction> findByCategoryId(Long categoryId);

    List<Auction> findBySellerId(Long sellerId);

    List<Auction> findByStatusAndStartTimeBeforeAndEndTimeAfter(
            AuctionStatus status, LocalDateTime startTime, LocalDateTime endTime);

    List<Auction> findByStatusAndEndTimeBefore(
            AuctionStatus status, LocalDateTime endTime);

    List<Auction> findByStatusAndWinnerIdIsNotNull(AuctionStatus status);

    // Tìm auction CLOSED có payment deadline đã qua
    List<Auction> findByStatusAndWinnerPaymentDeadlineBefore(
            AuctionStatus status, LocalDateTime deadline);

    List<Auction> findByStatusAndWinnerPaymentDeadlineBeforeAndWinnerIdIsNull(
            AuctionStatus status, LocalDateTime deadline);

}