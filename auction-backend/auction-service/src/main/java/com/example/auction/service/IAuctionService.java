package com.example.auction.service;

import com.example.auction.dto.AuctionRequestDTO;
import com.example.auction.dto.AuctionResponseDTO;

public interface IAuctionService {

    AuctionResponseDTO updateAuction(Long id, AuctionRequestDTO request);
    AuctionResponseDTO updateAuctionStatus(Long id, String status, Long requesterId);

}
