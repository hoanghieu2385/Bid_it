package com.example.auction.controller;

import com.example.auction.dto.MediaUploadRequestDTO;
import com.example.auction.dto.MediaResponseDTO;
import com.example.auction.service.MediaService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/media")
public class MediaController {

    private final MediaService mediaService;

    @Autowired
    public MediaController(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<MediaResponseDTO> upload(
            @RequestParam("auctionId") Long auctionId,
            @RequestParam("isThumbnail") Boolean isThumbnail,
            @RequestParam("file") MultipartFile file) {

        MediaUploadRequestDTO request = new MediaUploadRequestDTO();
        request.setAuctionId(auctionId);
        request.setIsThumbnail(isThumbnail);
        request.setFile(file);

        MediaResponseDTO response = mediaService.upload(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/auction/{auctionId}")
    public ResponseEntity<List<MediaResponseDTO>> getByAuction(@PathVariable Long auctionId) {
        return ResponseEntity.ok(mediaService.getMediaByAuctionId(auctionId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        mediaService.deleteMedia(id);
        return ResponseEntity.noContent().build();
    }
}
