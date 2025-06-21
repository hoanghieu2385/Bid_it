package com.example.auction.service;

import com.example.auction.client.UserClient;
import com.example.auction.dto.AuctionRequestDTO;
import com.example.auction.dto.AuctionResponseDTO;
import com.example.auction.dto.UserDTO;
import com.example.auction.exception.ResourceNotFoundException;
import com.example.auction.mapper.AuctionMapper;
import com.example.auction.model.Auction;
import com.example.auction.model.AuctionStatus;
import com.example.auction.repository.AuctionRepository;
import com.example.auction.service.IAuctionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.time.LocalDateTime;

@Service
public class AuctionService implements IAuctionService {

    private final AuctionRepository auctionRepository;
    private final UserClient userClient;
    private final AuctionMapper auctionMapper;

    @Autowired
    public AuctionService(AuctionRepository auctionRepository, UserClient userClient, AuctionMapper auctionMapper) {
        this.auctionRepository = auctionRepository;
        this.userClient = userClient;
        this.auctionMapper = auctionMapper;
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
        auction.setSellerId(requesterId);
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
        return auctionMapper.mapToResponseDTO(saved);
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
        return auctionMapper.mapToResponseDTO(updated);
    }

    public void updateCurrentBid(Long auctionId, BigDecimal currentBid, Integer bidCount) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        auction.setCurrentBid(currentBid);
        auction.setBidCount(bidCount);

        auctionRepository.save(auction);

        System.out.println("Updated auction " + auctionId + " currentBid to: " + currentBid + ", bidCount: " + bidCount);
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
        return auctionMapper.mapToResponseDTO(updated);
    }

    public AuctionResponseDTO updateWinner(Long auctionId, Long winnerId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));

        LocalDateTime now = LocalDateTime.now();

        boolean ended = auction.getEndTime() != null && auction.getEndTime().isBefore(now);
        boolean statusClosed = auction.getStatus() == AuctionStatus.CLOSED ||
                auction.getStatus() == AuctionStatus.SOLD ||
                auction.getStatus() == AuctionStatus.FAILED;

        if (!ended && !statusClosed) {
            throw new IllegalStateException("Cannot update winner until auction ends.");
        }

        auction.setWinnerId(winnerId);
        auction.setWinnerPaymentDeadline(now.plusDays(3));
        auction.setUpdatedAt(now);

        Auction saved = auctionRepository.save(auction);
        return auctionMapper.mapToResponseDTO(saved);
    }

    /**
     * Xác nhận thanh toán thành công - chuyển từ CLOSED sang SOLD
     */
    public AuctionResponseDTO confirmPayment(Long auctionId, String paymentId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));

        // Chỉ cho phép confirm payment nếu status là CLOSED
        if (auction.getStatus() != AuctionStatus.CLOSED) {
            throw new IllegalStateException("Can only confirm payment for CLOSED auctions. Current status: " + auction.getStatus());
        }

        // Kiểm tra có winner không
        if (auction.getWinnerId() == null) {
            throw new IllegalStateException("Cannot confirm payment - no winner found");
        }

        // Kiểm tra payment deadline
        LocalDateTime now = LocalDateTime.now();
        if (auction.getWinnerPaymentDeadline() != null && auction.getWinnerPaymentDeadline().isBefore(now)) {
            throw new IllegalStateException("Payment deadline has passed");
        }

        // Update status và thông tin thanh toán
        auction.setStatus(AuctionStatus.SOLD);
        auction.setUpdatedAt(now);
        // Có thể thêm field paymentId nếu cần
        // auction.setPaymentId(paymentId);

        Auction saved = auctionRepository.save(auction);

        System.out.println("Payment confirmed for auction " + auctionId +
                " - Status changed to SOLD (PaymentId: " + paymentId + ")");

        return auctionMapper.mapToResponseDTO(saved);
    }

    // Get All Auction - returns raw entities for Controller to use mapper
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

    // Return raw entities for Controller to use mapper
    public List<Auction> getAuctionsBySellerIdRaw(Long sellerId) {
        return auctionRepository.findBySellerId(sellerId);
    }

    // Keep old method for interface compatibility
    @Override
    public List<AuctionResponseDTO> getAuctionsBySellerId(Long sellerId) {
        List<Auction> auctions = auctionRepository.findBySellerId(sellerId);
        return auctionMapper.mapToResponseDTOList(auctions);
    }

    public void deleteAuction(Long auctionId, Long requesterId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));

        // Kiểm tra quyền admin thông qua UserClient
        UserDTO requester;
        try {
            requester = userClient.getUserById(requesterId);
            if (requester == null) {
                throw new IllegalArgumentException("User not found");
            }
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to verify requester identity", ex);
        }

        // Kiểm tra quyền: ADMIN hoặc chủ sở hữu auction
        boolean isAdmin = requester.getRoles() != null && requester.getRoles().contains("ADMIN");
        boolean isOwner = auction.getSellerId().equals(requesterId);

        if (!isAdmin && !isOwner) {
            throw new IllegalArgumentException("You don't have permission to delete this auction");
        }

        auctionRepository.delete(auction);
    }
    // Keep old mapToResponseDTO method for compatibility (but uses mapper)
    @Deprecated // Recommend using AuctionMapper instead
    public AuctionResponseDTO mapToResponseDTO(Auction auction) {
        return auctionMapper.mapToResponseDTO(auction);
    }

    public Auction save(Auction auction) {
        return auctionRepository.save(auction);
    }
}