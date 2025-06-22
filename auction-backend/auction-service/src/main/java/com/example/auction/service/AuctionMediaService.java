package com.example.auction.service;

import com.example.auction.dto.AuctionRequestDTO;
import com.example.auction.dto.AuctionResponseDTO;
import com.example.auction.dto.MediaUploadRequestDTO;
import com.example.auction.repository.AuctionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
public class AuctionMediaService {

    private final AuctionService auctionService;
    private final MediaService mediaService;
    private final AuctionRepository auctionRepository;

    public AuctionMediaService(AuctionService auctionService,
                               MediaService mediaService,
                               AuctionRepository auctionRepository) {
        this.auctionService = auctionService;
        this.mediaService = mediaService;
        this.auctionRepository = auctionRepository;
    }

    @Transactional(rollbackFor = Exception.class)
    public AuctionResponseDTO createAuctionWithMedia(
            AuctionRequestDTO auctionRequest,
            Long requesterId,
            List<MultipartFile> mediaFiles,
            List<Boolean> thumbnailFlags) {

        try {
            // 1. Tạo auction
            AuctionResponseDTO auction = auctionService.createAuction(auctionRequest, requesterId);

            // 2. Upload media files nếu có
            if (mediaFiles != null && !mediaFiles.isEmpty()) {
                for (int i = 0; i < mediaFiles.size(); i++) {
                    MediaUploadRequestDTO mediaRequest = new MediaUploadRequestDTO();
                    mediaRequest.setAuctionId(auction.getId());
                    mediaRequest.setFile(mediaFiles.get(i));
                    mediaRequest.setIsThumbnail(
                            thumbnailFlags != null && i < thumbnailFlags.size()
                                    ? thumbnailFlags.get(i)
                                    : (i == 0) // Ảnh đầu tiên làm thumbnail nếu không chỉ định
                    );

                    mediaService.upload(mediaRequest);
                }
            }

            return auction;

        } catch (Exception e) {
            // Transaction sẽ tự động rollback toàn bộ
            throw new RuntimeException("Failed to create auction with media: " + e.getMessage(), e);
        }
    }

    @Transactional(rollbackFor = Exception.class)
    public AuctionResponseDTO createAuctionWithMediaSimple(
            AuctionRequestDTO auctionRequest,
            Long requesterId,
            List<MultipartFile> mediaFiles) {

        try {
            // 1. Tạo auction
            AuctionResponseDTO auction = auctionService.createAuction(auctionRequest, requesterId);

            // 2. Upload media files nếu có
            if (mediaFiles != null && !mediaFiles.isEmpty()) {
                for (int i = 0; i < mediaFiles.size(); i++) {
                    MediaUploadRequestDTO mediaRequest = new MediaUploadRequestDTO();
                    mediaRequest.setAuctionId(auction.getId());
                    mediaRequest.setFile(mediaFiles.get(i));
                    mediaRequest.setIsThumbnail(i == 0); // Ảnh đầu tiên làm thumbnail

                    mediaService.upload(mediaRequest);
                }
            }

            return auction;

        } catch (Exception e) {
            // Transaction sẽ tự động rollback
            throw new RuntimeException("Failed to create auction with media: " + e.getMessage(), e);
        }
    }
}