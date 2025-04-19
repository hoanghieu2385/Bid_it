//package com.example.auction.service;
//
//import com.cloudinary.Cloudinary;
//import com.cloudinary.utils.ObjectUtils;
//import com.example.auction.model.Auction;
//import com.example.auction.model.Media;
//import com.example.auction.repository.MediaRepository;
//import org.springframework.beans.factory.annotation.Autowired;
//import org.springframework.stereotype.Service;
//import org.springframework.web.multipart.MultipartFile;
//
//import java.io.IOException;
//import java.util.Map;
//
//@Service
//public class MediaService {
//
//    private final Cloudinary cloudinary;
//    private final MediaRepository mediaRepository;
//    private final AuctionService auctionService; // if needed to fetch auction
//
//    @Autowired
//    public MediaService(Cloudinary cloudinary,
//                        MediaRepository mediaRepository,
//                        AuctionService auctionService) {
//        this.cloudinary = cloudinary;
//        this.mediaRepository = mediaRepository;
//        this.auctionService = auctionService;
//    }
//
//    public Media uploadMedia(Long auctionId, MultipartFile file, String mediaType) throws IOException {
//        // Upload the file to Cloudinary
//        Map uploadResult = cloudinary.uploader().upload(file.getBytes(), ObjectUtils.emptyMap());
//        String url = (String) uploadResult.get("secure_url");
//
//        // Retrieve the Auction object to associate with the media
//        Auction auction = auctionService.getAuctionById(auctionId)
//                .orElseThrow(() -> new RuntimeException("Auction not found with id: " + auctionId));
//
//        // Save the media record
//        Media media = Media.builder()
//                .auction(auction)
//                .url(url)
//                .mediaType(mediaType)
//                .build();
//        return mediaRepository.save(media);
//    }
//}
