package com.example.auction.repository;

import com.example.auction.model.Media;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MediaRepository extends JpaRepository<Media, Long> {

    List<Media> findByAuctionId(Long auctionId);

}