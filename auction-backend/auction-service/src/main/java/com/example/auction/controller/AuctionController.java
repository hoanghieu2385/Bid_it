package com.example.auction.controller;

import com.example.auction.dto.AuctionRequestDTO;
import com.example.auction.dto.AuctionResponseDTO;
import com.example.auction.dto.AuctionStatusUpdateDTO;
import com.example.auction.dto.WinnerUpdateDTO;
import com.example.auction.exception.ResourceNotFoundException;
import com.example.auction.mapper.AuctionMapper;
import com.example.auction.model.Auction;
import com.example.auction.model.AuctionStatus;
import com.example.auction.service.AuctionService;
import jakarta.validation.Valid;
import org.springframework.http.*;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Validated
@RestController
@RequestMapping("/api/auctions")
public class AuctionController {

    private final AuctionService auctionService;
    private final AuctionMapper auctionMapper;

    public AuctionController(AuctionService auctionService, AuctionMapper auctionMapper) {
        this.auctionService = auctionService;
        this.auctionMapper = auctionMapper;
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
        List<Auction> auctions = auctionService.getAllAuctions();
        List<AuctionResponseDTO> response = auctionMapper.mapToResponseDTOList(auctions);
        return ResponseEntity.ok(response);
    }

    // GET Auction by AuctionID
    @GetMapping("/{id}")
    public ResponseEntity<AuctionResponseDTO> getAuction(@PathVariable Long id) {
        Auction auction = auctionService.getAuctionById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + id));
        return ResponseEntity.ok(auctionMapper.mapToResponseDTO(auction));
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

        List<AuctionResponseDTO> response = auctionMapper.mapToResponseDTOList(auctions);
        return ResponseEntity.ok(response);
    }

    @PutMapping("/{id}/current-bid")
    public ResponseEntity<Void> updateCurrentBid(
            @PathVariable Long id,
            @RequestParam BigDecimal currentBid,
            @RequestParam Integer bidCount) {

        auctionService.updateCurrentBid(id, currentBid, bidCount);
        return ResponseEntity.ok().build();
    }

    // Update Auction Winner
    @PutMapping("/{id}/winner")
    public ResponseEntity<AuctionResponseDTO> updateAuctionWinner(
            @PathVariable Long id,
            @RequestBody WinnerUpdateDTO dto
    ) {
        Long winnerId = dto.getWinnerId();

        Auction auction = auctionService.getAuctionById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + id));

        boolean ended = auction.getEndTime() != null && auction.getEndTime().isBefore(LocalDateTime.now());
        boolean statusClosed = auction.getStatus() == AuctionStatus.CLOSED ||
                auction.getStatus() == AuctionStatus.SOLD ||
                auction.getStatus() == AuctionStatus.FAILED;

        if (!ended && !statusClosed) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(null);
        }

        auction.setWinnerId(winnerId);
        auction.setStatus(AuctionStatus.SOLD);
        auction.setUpdatedAt(LocalDateTime.now());

        Auction saved = auctionService.save(auction);
        return ResponseEntity.ok(auctionMapper.mapToResponseDTO(saved));
    }

    // GET Auction by Category
    @GetMapping("/search/category")
    public ResponseEntity<List<AuctionResponseDTO>> searchAuctionsByCategory(
            @RequestParam Long categoryId) {

        List<Auction> auctions = auctionService.findAuctionsByCategory(categoryId);
        List<AuctionResponseDTO> response = auctionMapper.mapToResponseDTOList(auctions);
        return ResponseEntity.ok(response);
    }

    // GET Auction by UserID - FIXED: Now uses mapper consistently
    @GetMapping("/seller/{sellerId}")
    public ResponseEntity<List<AuctionResponseDTO>> getAuctionsBySellerId(@PathVariable Long sellerId) {
        // Sử dụng method trả về raw entities
        List<Auction> auctions = auctionService.getAuctionsBySellerIdRaw(sellerId);

        // Sử dụng mapper để đảm bảo mapping nhất quán với media và user data
        List<AuctionResponseDTO> response = auctionMapper.mapToResponseDTOList(auctions);

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

    // Removed the old mapToResponseDTO method since we now use AuctionMapper
}