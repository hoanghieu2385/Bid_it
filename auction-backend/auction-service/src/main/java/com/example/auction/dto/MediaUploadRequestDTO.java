package com.example.auction.dto;

import org.springframework.web.multipart.MultipartFile;

public class MediaUploadRequestDTO {

    private Long auctionId;
    private Boolean isThumbnail;
    private MultipartFile file;

    public Long getAuctionId() { return auctionId; }
    public void setAuctionId(Long auctionId) { this.auctionId = auctionId; }

    public Boolean getIsThumbnail() { return isThumbnail; }
    public void setIsThumbnail(Boolean isThumbnail) { this.isThumbnail = isThumbnail; }

    public MultipartFile getFile() { return file; }
    public void setFile(MultipartFile file) { this.file = file; }

}
