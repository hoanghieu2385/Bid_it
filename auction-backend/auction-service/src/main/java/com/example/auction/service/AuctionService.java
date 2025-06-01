package com.example.auction.service;

import com.example.auction.client.UserClient;
import com.example.auction.dto.AuctionRequestDTO;
import com.example.auction.dto.AuctionResponseDTO;
import com.example.auction.dto.UserDTO;
import com.example.auction.exception.ResourceNotFoundException;
import com.example.auction.model.Auction;
import com.example.auction.model.AuctionStatus;
import com.example.auction.repository.AuctionRepository;
import com.example.auction.service.IAuctionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;
import java.util.stream.Collectors;

@Service
public class AuctionService implements IAuctionService{

    private final AuctionRepository auctionRepository;
    private final UserClient userClient;

    @Autowired
    public AuctionService(AuctionRepository auctionRepository, UserClient userClient) {
        this.auctionRepository = auctionRepository;
        this.userClient = userClient;
    }

    // Create Auction
    public AuctionResponseDTO createAuction(AuctionRequestDTO request, Long requesterId) {
        if (requesterId == null) {
            throw new IllegalArgumentException("Seller (requester) ID is required");
        }

        try {
            UserDTO seller = userClient.getUserById(requesterId);
            if (seller == null || !Boolean.TRUE.equals(seller.getVerified())) {
                throw new IllegalArgumentException("Seller not verified or does not exist");
            }
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to fetch seller from user-service", ex);
        }

        Auction auction = new Auction();
        auction.setTitle(request.getTitle());
        auction.setDescription(request.getDescription());
        auction.setSellerId(requesterId); // here’s the important change
        auction.setCategoryId(request.getCategoryId());
        auction.setStartTime(request.getStartTime());
        auction.setEndTime(request.getEndTime());
        auction.setStartingPrice(request.getStartingPrice());
        auction.setIncrementAmount(request.getIncrementAmount());
        auction.setCurrentBid(request.getCurrentBid());
        auction.setRequiresDeposit(request.getRequiresDeposit());
        auction.setSecurityDeposit(request.getSecurityDeposit());

        // Optional: validate status string
        if (request.getStatus() != null) {
            try {
                auction.setStatus(AuctionStatus.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException ex) {
                throw new IllegalArgumentException("Invalid auction status");
            }
        }

        if (request.getBidCount() != null) {
            auction.setBidCount(request.getBidCount());
        }

        Auction saved = auctionRepository.save(auction);
        return mapToResponseDTO(saved);
    }

    // Update Auction
    public AuctionResponseDTO updateAuction(Long id, AuctionRequestDTO request, Long requesterId) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + id));

        // Prevent update if auction has started
        if (auction.getStartTime().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Cannot update auction that has already started.");
        }

        if (requesterId == null) {
            throw new IllegalArgumentException("Seller ID is required");
        }

        // Validate seller
        try {
            UserDTO seller = userClient.getUserById(requesterId);
            if (seller == null || !Boolean.TRUE.equals(seller.getVerified())) {
                throw new IllegalArgumentException("Seller not verified or does not exist");
            }
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to fetch seller from user-service", ex);
        }

        auction.setTitle(request.getTitle());
        auction.setDescription(request.getDescription());
        auction.setSellerId(requesterId);
        auction.setCategoryId(request.getCategoryId());
        auction.setStartTime(request.getStartTime());
        auction.setEndTime(request.getEndTime());
        auction.setStartingPrice(request.getStartingPrice());
        auction.setIncrementAmount(request.getIncrementAmount());
        auction.setCurrentBid(request.getCurrentBid());
        auction.setRequiresDeposit(request.getRequiresDeposit());
        auction.setSecurityDeposit(request.getSecurityDeposit());

        if (request.getStatus() != null) {
            try {
                auction.setStatus(AuctionStatus.valueOf(request.getStatus().toUpperCase()));
            } catch (IllegalArgumentException ex) {
                throw new IllegalArgumentException("Invalid auction status");
            }
        }

        if (request.getBidCount() != null) {
            auction.setBidCount(request.getBidCount());
        }

        Auction updated = auctionRepository.save(auction);
        return mapToResponseDTO(updated);
    }


    // Update Auction STATUS
    public AuctionResponseDTO updateAuctionStatus(Long id, String status, Long requesterId) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + id));

        UserDTO requester;
        try {
            requester = userClient.getUserById(requesterId);
            if (requester == null || requester.getRoles() == null || !requester.getRoles().contains("ADMIN")) {
                throw new IllegalAccessError("Only admin users can update auction status.");
            }
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to verify requester identity", ex);
        }

        try {
            AuctionStatus newStatus = AuctionStatus.valueOf(status.toUpperCase());
            auction.setStatus(newStatus);
        } catch (IllegalArgumentException ex) {
            throw new IllegalArgumentException("Invalid auction status: " + status);
        }

        Auction updated = auctionRepository.save(auction);
        return mapToResponseDTO(updated);
    }

    // Get All Auction
    public List<Auction> getAllAuctions() {
        return auctionRepository.findAll();
    }

    // Get Auction by AuctionID
    public Optional<Auction> getAuctionById(Long id) {
        return auctionRepository.findById(id);
    }

    // Get Auction by CategoryID
    public List<Auction> findAuctionsByCategory(Long categoryId) {
        return auctionRepository.findByCategoryId(categoryId);
    }

    // Get Auction by Auction STATUS
    public List<Auction> findAuctionsByStatus(AuctionStatus status) {
        return auctionRepository.findByStatus(status);
    }

    // Get Auction by UserID
    @Override
    public List<AuctionResponseDTO> getAuctionsBySellerId(Long sellerId) {
        List<Auction> auctions = auctionRepository.findBySellerId(sellerId);
        return auctions.stream()
                .map(this::mapToResponseDTO)
                .collect(Collectors.toList());
    }

    // SOFT Delete Auction by AuctionID
    public void deleteAuction(Long id, Long requesterId) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + id));

        UserDTO requester = userClient.getUserById(requesterId);
        if (requester.getRoles() == null || !requester.getRoles().contains("ADMIN")) {
            throw new SecurityException("Only admins can delete auctions");
        }

        auctionRepository.delete(auction);
    }

    // Get Seller info via UserID
    public UserDTO getSellerInfo(Long sellerId) {
        try {
            return userClient.getUserById(sellerId);
        } catch (Exception e) {
            return null;
        }
    }

    private AuctionResponseDTO mapToResponseDTO(Auction auction) {
        UserDTO seller;
        try {
            seller = userClient.getUserById(auction.getSellerId());
        } catch (Exception e) {
            seller = null;
        }

        return new AuctionResponseDTO.Builder()
                .id(auction.getId())
                .title(auction.getTitle())
                .description(auction.getDescription())
                .startingPrice(auction.getStartingPrice())
                .incrementAmount(auction.getIncrementAmount())
                .startTime(auction.getStartTime())
                .endTime(auction.getEndTime())
                .categoryId(auction.getCategoryId())
                .sellerId(auction.getSellerId())
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
                .user(seller)
                .build();
    }
}
