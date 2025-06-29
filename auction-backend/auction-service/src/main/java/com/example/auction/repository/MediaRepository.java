package com.example.auction.repository;

import com.example.auction.model.Media;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MediaRepository extends JpaRepository<Media, Long> {

    List<Media> findByAuctionId(Long auctionId);

    // Tìm ảnh thumbnail nếu có, ưu tiên cờ isThumbnail
    @Query("SELECT m FROM Media m WHERE m.auctionId = :auctionId AND m.isThumbnail = true")
    Media findThumbnailByAuctionId(@Param("auctionId") Long auctionId);

    // Nếu chưa có thumbnail, lấy ảnh đầu tiên theo ID tăng dần
    Media findFirstByAuctionIdOrderByIdAsc(Long auctionId);
}