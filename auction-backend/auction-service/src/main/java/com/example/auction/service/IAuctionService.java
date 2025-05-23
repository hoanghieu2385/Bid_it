package com.example.auction.service;

import com.example.auction.dto.AuctionRequestDTO;
import com.example.auction.dto.AuctionResponseDTO;
import java.util.List;

public interface IAuctionService {

    AuctionResponseDTO updateAuction(Long id, AuctionRequestDTO request, Long requesterId);
    AuctionResponseDTO updateAuctionStatus(Long id, String status, Long requesterId);
    List<AuctionResponseDTO> getAuctionsBySellerId(Long sellerId);

}
