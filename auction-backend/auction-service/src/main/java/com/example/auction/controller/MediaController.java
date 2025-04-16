//package com.example.auction.controller;
//
//import com.example.auction.model.Media;
//import com.example.auction.service.MediaService;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.http.*;
//import org.springframework.web.bind.annotation.*;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.IOException;
//
//@RestController
//@RequestMapping("/api/auctions/{auctionId}/media")
//public class MediaController {
//
//    private final MediaService mediaService;
//
//    @Autowired
//    public MediaController(MediaService mediaService) {
//        this.mediaService = mediaService;
//    }
//
//    @PostMapping
//    public ResponseEntity<Media> uploadMedia(@PathVariable Long auctionId,
//                                             @RequestParam("file") MultipartFile file,
//                                             @RequestParam("mediaType") String mediaType) {
//        try {
//            Media uploadedMedia = mediaService.uploadMedia(auctionId, file, mediaType);
//            return ResponseEntity.status(HttpStatus.CREATED).body(uploadedMedia);
//        } catch (IOException e) {
//            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
//        }
//    }
//}
