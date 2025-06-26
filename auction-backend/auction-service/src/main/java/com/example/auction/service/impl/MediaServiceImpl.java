package com.example.auction.service.impl;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.auction.dto.MediaUploadRequestDTO;
import com.example.auction.dto.MediaResponseDTO;
import com.example.auction.exception.ResourceNotFoundException;
import com.example.auction.model.Media;
import com.example.auction.repository.MediaRepository;
import com.example.auction.service.MediaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.*;

@Service
public class MediaServiceImpl implements MediaService {

    private final Cloudinary cloudinary;
    private final MediaRepository mediaRepository;

    @Autowired
    public MediaServiceImpl(Cloudinary cloudinary, MediaRepository mediaRepository) {
        this.cloudinary = cloudinary;
        this.mediaRepository = mediaRepository;
    }

    @Override
    public MediaResponseDTO upload(MediaUploadRequestDTO request) {
        MultipartFile file = request.getFile();

        String contentType = file.getContentType();
        if (contentType == null ||
                !(contentType.startsWith("image/jpeg") || contentType.startsWith("image/jpg") || contentType.startsWith("image/png") || contentType.startsWith("video/mp4"))) {
            throw new IllegalArgumentException("Only image and video files are allowed.");
        }

        try {
            Map uploadResult = cloudinary.uploader().upload(
                    file.getBytes(),
                    ObjectUtils.asMap("resource_type", "auto")
            );

            Media media = new Media();
            media.setAuctionId(request.getAuctionId());
            media.setPublicId((String) uploadResult.get("public_id"));
            media.setUrl((String) uploadResult.get("secure_url"));
            media.setFormat((String) uploadResult.get("format"));
            media.setResourceType((String) uploadResult.get("resource_type"));
            media.setIsThumbnail(request.getIsThumbnail());

            Media saved = mediaRepository.save(media);
            return mapToDTO(saved);

        } catch (IOException e) {
            throw new RuntimeException("Failed to upload image", e);
        }
    }
    @Override
    public String getMainImageUrlByAuctionId(Long auctionId) {
        List<Media> mediaList = mediaRepository.findByAuctionId(auctionId);

        // Ưu tiên ảnh thumbnail nếu có
        Optional<Media> thumbnail = mediaList.stream()
                .filter(media -> Boolean.TRUE.equals(media.getIsThumbnail()))
                .findFirst();

        if (thumbnail.isPresent()) {
            return thumbnail.get().getUrl();
        }

        // Nếu không có thumbnail, lấy ảnh đầu tiên (nếu có)
        if (!mediaList.isEmpty()) {
            return mediaList.get(0).getUrl();
        }

        // Nếu không có ảnh nào thì trả về null (hoặc fallback URL nếu muốn)
        return null;
    }

    @Override
    public List<MediaResponseDTO> getMediaByAuctionId(Long auctionId) {
        List<Media> mediaList = mediaRepository.findByAuctionId(auctionId);
        List<MediaResponseDTO> responseList = new ArrayList<>();
        for (Media media : mediaList) {
            responseList.add(mapToDTO(media));
        }
        return responseList;
    }

    @Override
    public void deleteMedia(Long id) {
        Optional<Media> mediaOpt = mediaRepository.findById(id);
        if (mediaOpt.isPresent()) {
            Media media = mediaOpt.get();
            try {
                cloudinary.uploader().destroy(media.getPublicId(), ObjectUtils.emptyMap());
                mediaRepository.deleteById(id);
            } catch (IOException e) {
                throw new RuntimeException("Cloudinary deletion failed", e);
            }
        } else {
            throw new NoSuchElementException("Media not found with ID: " + id);
        }
    }

    @Override
    @Transactional
    public void setAsThumbnail(Long mediaId) {
        Media media = mediaRepository.findById(mediaId)
                .orElseThrow(() -> new ResourceNotFoundException("Media not found with ID: " + mediaId));

        // Clear old thumbnails for this auction
        List<Media> auctionMediaList = mediaRepository.findByAuctionId(media.getAuctionId());
        for (Media m : auctionMediaList) {
            if (Boolean.TRUE.equals(m.getIsThumbnail())) {
                m.setIsThumbnail(false);
                mediaRepository.save(m);
            }
        }

        // Set the selected media as the new thumbnail
        media.setIsThumbnail(true);
        mediaRepository.save(media);
    }

    private MediaResponseDTO mapToDTO(Media media) {
        MediaResponseDTO dto = new MediaResponseDTO();
        dto.setId(media.getId());
        dto.setUrl(media.getUrl());
        dto.setPublicId(media.getPublicId());
        dto.setFormat(media.getFormat());
        dto.setResourceType(media.getResourceType());
        dto.setIsThumbnail(media.getIsThumbnail());
        dto.setCreatedAt(media.getCreatedAt());
        return dto;
    }

}
