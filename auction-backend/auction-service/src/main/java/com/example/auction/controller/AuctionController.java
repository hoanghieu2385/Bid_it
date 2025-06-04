package com.example.auction.controller;

import com.example.auction.dto.AuctionRequestDTO;
import com.example.auction.dto.AuctionResponseDTO;
import com.example.auction.dto.AuctionStatusUpdateDTO;
import com.example.auction.dto.MediaResponseDTO;
import com.example.auction.dto.UserDTO;
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

    // CREATE Auction
    @PostMapping
    public ResponseEntity<AuctionResponseDTO> createAuction(
            @Valid @RequestBody AuctionRequestDTO auctionRequestDTO,
            @RequestParam("requesterId") Long requesterId
    ) {
        AuctionResponseDTO response = auctionService.createAuction(auctionRequestDTO, requesterId);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // GET ALL Auctions
    @GetMapping
    public ResponseEntity<List<AuctionResponseDTO>> getAuctions() {
        List<AuctionResponseDTO> auctions = auctionService.getAllAuctions().stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
        return ResponseEntity.ok(auctions);
    }

    // GET Auction by AuctionID
    @GetMapping("/{id}")
    public ResponseEntity<AuctionResponseDTO> getAuction(@PathVariable Long id) {
        Auction auction = auctionService.getAuctionById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + id));
        return ResponseEntity.ok(mapToResponseDTO(auction));
    }

    // GET Auction by AuctionStatus
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

    @PutMapping("/{id}/winner")
    public ResponseEntity<AuctionResponseDTO> updateAuctionWinner(
            @PathVariable Long id,
            @RequestParam("winnerId") Long winnerId
    ) {
        Auction auction = auctionService.getAuctionById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + id));

        // ENFORCE: Chỉ cho cập nhật nếu đã kết thúc
        boolean ended = auction.getEndTime() != null && auction.getEndTime().isBefore(LocalDateTime.now());
        boolean statusClosed = auction.getStatus() == AuctionStatus.CLOSED ||
                auction.getStatus() == AuctionStatus.SOLD ||
                auction.getStatus() == AuctionStatus.FAILED;

        if (!ended && !statusClosed) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(null); // Hoặc throw exception với message rõ ràng
        }

        // Log để tracking
        System.out.println("Updating winner for auction " + id + " to user " + winnerId);

        auction.setWinnerId(winnerId);
        auction.setStatus(AuctionStatus.SOLD); // Hoặc CLOSED
        auction.setUpdatedAt(LocalDateTime.now());

        Auction saved = auctionService.save(auction);

        System.out.println("Successfully updated winner for auction " + id);
        return ResponseEntity.ok(auctionService.mapToResponseDTO(saved));
    }

    // GET Auction by Category
    @GetMapping("/search/category")
    public ResponseEntity<List<AuctionResponseDTO>> searchAuctionsByCategory(
            @RequestParam Long categoryId) {

        List<Auction> auctions = auctionService.findAuctionsByCategory(categoryId);

        List<AuctionResponseDTO> response = auctions.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());

        return ResponseEntity.ok(response);
    }

    // GET Auction by UserID
    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<AuctionResponseDTO>> getAuctionsBySellerId(@PathVariable Long sellerId) {
        List<AuctionResponseDTO> response = auctionService.getAuctionsBySellerId(sellerId);

        return ResponseEntity.ok(response);
    }

    // PUT Auction Status by AuctionID
    @PutMapping("/{id}/status")
    public ResponseEntity<AuctionResponseDTO> updateAuctionStatus(
            @PathVariable Long id,
            @RequestParam("requesterId") Long requesterId,
            @Valid @RequestBody AuctionStatusUpdateDTO statusUpdateDTO) {
        AuctionResponseDTO updated = auctionService.updateAuctionStatus(id, statusUpdateDTO.getStatus(), requesterId);
        return ResponseEntity.ok(updated);
    }

    // PUT Auction (full) by AuctionID
    @PutMapping("/{id}")
    public ResponseEntity<AuctionResponseDTO> updateAuction(
            @PathVariable Long id,
            @Valid @RequestBody AuctionRequestDTO auctionRequestDTO,
            @RequestParam("requesterId") Long requesterId
    ) {
        return ResponseEntity.ok(auctionService.updateAuction(id, auctionRequestDTO, requesterId));
    }

    // DELETE Auction by AuctionID
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAuction(
            @PathVariable Long id,
            @RequestParam Long requesterId) {
        auctionService.deleteAuction(id, requesterId);
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

        UserDTO seller = auctionService.getSellerInfo(auction.getSellerId()); // new helper to add in service

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
                .user(seller)
                .build();
    }
}