package com.example.auction.controller;

import com.example.auction.dto.AuctionRequestDTO;
import com.example.auction.dto.AuctionResponseDTO;
import com.example.auction.dto.AuctionStatusUpdateDTO;
import com.example.auction.dto.MediaResponseDTO;
import com.example.auction.exception.ResourceNotFoundException;
import com.example.auction.model.Auction;
import com.example.auction.model.AuctionStatus;
import com.example.auction.service.AuctionService;
import com.example.auction.service.MediaService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Validated
@RestController
@RequestMapping("/api/auctions")
public class AuctionController {

    private final AuctionService auctionService;
    private final MediaService mediaService;

    public AuctionController(AuctionService auctionService, MediaService mediaService) {
        this.auctionService = auctionService;
        this.mediaService = mediaService;
    }

    @PostMapping
    public ResponseEntity<AuctionResponseDTO> createAuction(@RequestBody @Valid AuctionRequestDTO auctionRequest) {
        Auction auction = new Auction.Builder()
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

    @GetMapping("/search/status")
    public ResponseEntity<List<AuctionResponseDTO>> searchAuctionsByStatus(
            @RequestParam String status) {

        List<Auction> auctions;
        try {
            AuctionStatus auctionStatus = AuctionStatus.valueOf(status.toUpperCase());
            auctions = auctionService.findAuctionsByStatus(auctionStatus);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }

        List<AuctionResponseDTO> response = auctions.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @GetMapping("/search/category")
    public ResponseEntity<List<AuctionResponseDTO>> searchAuctionsByCategory(
            @RequestParam Long categoryId) {

        List<Auction> auctions = auctionService.findAuctionsByCategory(categoryId);

        List<AuctionResponseDTO> response = auctions.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<AuctionResponseDTO> updateAuctionStatus(
            @PathVariable Long id,
            @Valid @RequestBody AuctionStatusUpdateDTO statusUpdateDTO) {

        // Retrieve auction or throw exception if not found
        Auction auction = auctionService.getAuctionById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + id));

        // Validate and convert status; handle invalid status string
        try {
            AuctionStatus newStatus = AuctionStatus.valueOf(statusUpdateDTO.getStatus().toUpperCase());
            auction.setStatus(newStatus);
        } catch (IllegalArgumentException ex) {
            return ResponseEntity.badRequest().build();
        }

        // Update auction (this will call repository.save)
        Auction updatedAuction = auctionService.updateAuction(auction);
        return ResponseEntity.ok(mapToResponseDTO(updatedAuction));
    }

    @PutMapping("/{id}")
    public ResponseEntity<AuctionResponseDTO> updateAuction(
            @PathVariable Long id,
            @Valid @RequestBody AuctionRequestDTO auctionRequestDTO) {

        Auction existingAuction = auctionService.getAuctionById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + id));

        // Check if auction has already started
        if (existingAuction.getStartTime().isBefore(LocalDateTime.now())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(null); // Alternatively, replace with an error message
        }

        // Update fields based on the DTO
        existingAuction.setTitle(auctionRequestDTO.getTitle());
        existingAuction.setDescription(auctionRequestDTO.getDescription());
        existingAuction.setSellerId(auctionRequestDTO.getSellerId());
        existingAuction.setCategoryId(auctionRequestDTO.getCategoryId());
        existingAuction.setStartTime(auctionRequestDTO.getStartTime());
        existingAuction.setEndTime(auctionRequestDTO.getEndTime());
        existingAuction.setStartingPrice(auctionRequestDTO.getStartingPrice());
        existingAuction.setIncrementAmount(auctionRequestDTO.getIncrementAmount());
        existingAuction.setCurrentBid(auctionRequestDTO.getCurrentBid());
        existingAuction.setRequiresDeposit(auctionRequestDTO.getRequiresDeposit());
        existingAuction.setSecurityDeposit(auctionRequestDTO.getSecurityDeposit());

        if (auctionRequestDTO.getStatus() != null) {
            try {
                existingAuction.setStatus(AuctionStatus.valueOf(auctionRequestDTO.getStatus().toUpperCase()));
            } catch (IllegalArgumentException ex) {
                return ResponseEntity.badRequest().build();
            }
        }

        if (auctionRequestDTO.getBidCount() != null) {
            existingAuction.setBidCount(auctionRequestDTO.getBidCount());
        }

        Auction updatedAuction = auctionService.updateAuction(existingAuction);
        return ResponseEntity.ok(mapToResponseDTO(updatedAuction));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAuction(@PathVariable Long id) {
        Auction auction = auctionService.getAuctionById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + id));

        auctionService.deleteAuction(auction.getId());
        return ResponseEntity.noContent().build();
    }

    // Helper method to map Auction entity to AuctionResponseDTO
    private AuctionResponseDTO mapToResponseDTO(Auction auction) {

        List<MediaResponseDTO> mediaList = mediaService.getMediaByAuctionId(auction.getId());

        String thumbnailUrl = mediaList.stream()
                .filter(media -> Boolean.TRUE.equals(media.getIsThumbnail()))
                .map(MediaResponseDTO::getUrl)
                .findFirst()
                .orElse(null);

        return new AuctionResponseDTO.Builder()
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
                .media(mediaList)
                .thumbnailUrl(thumbnailUrl)
                .build();
    }
}