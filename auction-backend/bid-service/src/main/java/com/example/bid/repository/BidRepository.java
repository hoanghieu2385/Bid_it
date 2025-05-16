package com.example.bid.repository;

import com.example.bid.model.Bid;
import java.math.BigDecimal;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BidRepository extends JpaRepository<Bid, Long> {

    List<Bid> findByAuctionId(Long auctionId);
    Bid findTopByAuctionIdOrderByAmountDesc(Long auctionId);
    List<Bid> findByBidderId(Long bidderId);
    long countByAuctionId(Long auctionId);

    boolean existsByAuctionIdAndBidderIdAndAmount(Long auctionId, Long bidderId, BigDecimal amount);
    Bid findTopByAuctionIdAndAmountOrderByCreatedAtAsc(Long auctionId, BigDecimal amount);

}
