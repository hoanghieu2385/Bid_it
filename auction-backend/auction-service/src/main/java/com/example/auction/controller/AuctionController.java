package com.example.auction.controller;

import com.example.auction.dto.AuctionRequestDTO;
import com.example.auction.dto.AuctionResponseDTO;
import com.example.auction.exception.ResourceNotFoundException;
import com.example.auction.model.Auction;
import com.example.auction.model.AuctionStatus;
import com.example.auction.service.AuctionService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/auctions")
public class AuctionController {

    private final AuctionService auctionService;

    @Autowired
    public AuctionController(AuctionService auctionService) {
        this.auctionService = auctionService;
    }

    @PostMapping
    public ResponseEntity<AuctionResponseDTO> createAuction(@Valid @RequestBody AuctionRequestDTO auctionRequest) {
        Auction auction = Auction.builder()
                .title(auctionRequest.getTitle())
                .description(auctionRequest.getDescription())
                .sellerId(auctionRequest.getSellerId())
                .categoryId(auctionRequest.getCategoryId())
                .startTime(auctionRequest.getStartTime())
                .endTime(auctionRequest.getEndTime())
                .startingPrice(auctionRequest.getStartingPrice())
                .incrementAmount(auctionRequest.getIncrementAmount())
                .currentBid(auctionRequest.getCurrentBid())
                .requiresDeposit(auctionRequest.getRequiresDeposit())
                .securityDeposit(auctionRequest.getSecurityDeposit())
                // If status is not provided, default to UPCOMING
                .status(auctionRequest.getStatus() != null
                        ? AuctionStatus.valueOf(auctionRequest.getStatus().toUpperCase())
                        : AuctionStatus.UPCOMING)
                .bidCount(auctionRequest.getBidCount() != null ? auctionRequest.getBidCount() : 0)
                .build();

        Auction savedAuction = auctionService.createAuction(auction);
        AuctionResponseDTO response = mapToResponseDTO(savedAuction);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping
    public ResponseEntity<List<AuctionResponseDTO>> getAuctions() {
        List<AuctionResponseDTO> auctions = auctionService.getAllAuctions().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(auctions);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AuctionResponseDTO> getAuction(@PathVariable Long id) {
        Auction auction = auctionService.getAuctionById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + id));
        return ResponseEntity.ok(mapToResponseDTO(auction));
    }

    // Helper method to map Auction entity to AuctionResponseDTO
    private AuctionResponseDTO mapToResponseDTO(Auction auction) {
        return AuctionResponseDTO.builder()
                .id(auction.getId())
                .title(auction.getTitle())
                .description(auction.getDescription())
                .sellerId(auction.getSellerId())
                .categoryId(auction.getCategoryId())
                .startTime(auction.getStartTime())
                .endTime(auction.getEndTime())
                .startingPrice(auction.getStartingPrice())
                .incrementAmount(auction.getIncrementAmount())
                .currentBid(auction.getCurrentBid())
                .requiresDeposit(auction.getRequiresDeposit())
                .securityDeposit(auction.getSecurityDeposit())
                .status(auction.getStatus().name())
                .bidCount(auction.getBidCount())
                .winnerId(auction.getWinnerId())
                .winnerPaymentDeadline(auction.getWinnerPaymentDeadline())
                .disputeRequestDeadline(auction.getDisputeRequestDeadline())
                .createdAt(auction.getCreatedAt())
                .updatedAt(auction.getUpdatedAt())
                .deletedAt(auction.getDeletedAt())
                .build();
    }
}
