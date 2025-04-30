package com.example.auction.service;

import com.example.auction.dto.MediaUploadRequestDTO;
import com.example.auction.dto.MediaResponseDTO;

import java.util.List;

public interface MediaService {

    MediaResponseDTO upload(MediaUploadRequestDTO request);
    List<MediaResponseDTO> getMediaByAuctionId(Long auctionId);
    void deleteMedia(Long id);
    void setAsThumbnail(Long mediaId);

}
