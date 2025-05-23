package com.example.auction.repository;

import com.example.auction.model.Auction;
import com.example.auction.model.AuctionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AuctionRepository extends JpaRepository<Auction, Long> {

    List<Auction> findByStatus(AuctionStatus status);
    List<Auction> findByCategoryId(Long categoryId);
    List<Auction> findBySellerId(Long sellerId);

}
