package com.example.auction.service;

import com.example.auction.dto.AuctionRequestDTO;
import com.example.auction.dto.AuctionResponseDTO;
import com.example.auction.model.Auction;

import java.util.List;

public interface IAuctionService {

    // Methods trả về DTO (để tương thích với code cũ)
    AuctionResponseDTO updateAuction(Long id, AuctionRequestDTO request, Long requesterId);
    AuctionResponseDTO updateAuctionStatus(Long id, String status, Long requesterId);
    List<AuctionResponseDTO> getAuctionsBySellerId(Long sellerId);

    // Thêm methods trả về raw entities để Controller có thể sử dụng mapper
    List<Auction> getAuctionsBySellerIdRaw(Long sellerId);
}