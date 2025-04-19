//package com.example.auction.model;
//
//import jakarta.persistence.*;
//import lombok.*;
//import org.hibernate.annotations.CreationTimestamp;
//import org.hibernate.annotations.UpdateTimestamp;
//
//import java.time.LocalDateTime;
//
//@Entity
//@Table(name = "media")
//@Getter
//@Setter
//@NoArgsConstructor
//@AllArgsConstructor
//@Builder
//public class Media {
//
//    @Id
//    @GeneratedValue(strategy = GenerationType.IDENTITY)
//    private Long id;
//
//    // Associate media with an Auction; assuming many media items per auction.
//    @ManyToOne(fetch = FetchType.LAZY)
//    @JoinColumn(name = "auction_id", nullable = false)
//    private Auction auction;
//
//    // URL returned by Cloudinary after upload.
//    @Column(nullable = false)
//    private String url;
//
//    // You might store a type such as "image" or "video"
//    @Column(nullable = false)
//    private String mediaType;
//
//    @CreationTimestamp
//    @Column(name = "created_at", updatable = false)
//    private LocalDateTime createdAt;
//
//    @UpdateTimestamp
//    @Column(name = "updated_at")
//    private LocalDateTime updatedAt;
//}
