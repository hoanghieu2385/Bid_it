package com.example.auction.service;

public interface IAuctionService {

    AuctionResponseDTO updateAuction(Long id, AuctionRequestDTO request);
    AuctionResponseDTO updateAuctionStatus(Long id, String status, Long requesterId);

}
