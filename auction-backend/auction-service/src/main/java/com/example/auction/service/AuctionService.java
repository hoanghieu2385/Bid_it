package com.example.auction.service;

import com.example.auction.client.EmailClient;
import com.example.auction.client.UserClient;
import com.example.auction.dto.AuctionRequestDTO;
import com.example.auction.dto.AuctionResponseDTO;
import com.example.auction.dto.AuctionWinEmailRequest;
import com.example.auction.dto.UserDTO;
import com.example.auction.exception.ResourceNotFoundException;
import com.example.auction.mapper.AuctionMapper;
import com.example.auction.model.Auction;
import com.example.auction.model.AuctionStatus;
import com.example.auction.repository.AuctionRepository;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AuctionService implements IAuctionService {

    private final AuctionRepository auctionRepository;
    private final UserClient userClient;
    private final AuctionMapper auctionMapper;
    private final MediaService mediaService;
    private final EmailClient emailClient;

    @Value("${app.base-url}")
    private String baseUrl;

    public AuctionService(
            AuctionRepository auctionRepository,
            UserClient userClient,
            AuctionMapper auctionMapper,
            MediaService mediaService,
            EmailClient emailClient
    ) {
        this.auctionRepository = auctionRepository;
        this.userClient = userClient;
        this.auctionMapper = auctionMapper;
        this.mediaService = mediaService;
        this.emailClient = emailClient;
    }

    /**
     * Helper method to check if user is verified based on citizenIdStatus
     */
    private boolean isUserVerified(UserDTO user) {
        if (user == null) {
            System.out.println("🚨 User is null");
            return false;
        }

        System.out.println("👤 User ID: " + user.getId());
        System.out.println("📧 User Email: " + user.getEmail());
        System.out.println("🆔 Citizen ID Status: " + user.getCitizenIdStatus());
        System.out.println("✅ Old Verified field: " + user.getVerified());

        String citizenIdStatus = user.getCitizenIdStatus();
        boolean isApproved = "APPROVED".equals(citizenIdStatus);

        System.out.println("🔍 Is APPROVED: " + isApproved);

        return isApproved;
    }

    @Retryable(value = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public AuctionResponseDTO createAuction(AuctionRequestDTO request, Long requesterId) {
        System.out.println("🔥 === START createAuction ===");
        System.out.println("👤 Requester ID: " + requesterId);

        if (requesterId == null) {
            System.out.println("❌ Requester ID is null");
            throw new IllegalArgumentException("Seller (requester) ID is required");
        }

        UserDTO seller;
        try {
            System.out.println("🔍 Fetching seller from user-service...");
            seller = userClient.getUserById(requesterId);
            System.out.println("✅ Seller fetched successfully");
        } catch (Exception ex) {
            System.out.println("❌ Failed to fetch seller: " + ex.getMessage());
            throw new IllegalStateException("Failed to fetch seller from user-service", ex);
        }

        System.out.println("🔍 Checking user verification...");
        if (!isUserVerified(seller)) {
            System.out.println("❌ User verification failed");
            throw new IllegalArgumentException("Seller not verified or does not exist. Citizen ID must be approved to create auctions.");
        }
        System.out.println("✅ User verification passed");

        Integer sellerScore;
        try {
            sellerScore = userClient.getUserScore(requesterId);
            System.out.println("📊 Seller score: " + sellerScore);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to fetch score from user-service", ex);
        }

        if (sellerScore == null) sellerScore = 0;

        if (sellerScore < 70) {
            throw new IllegalArgumentException("At least 70 points are required to create an auction");
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

        if (request.getStatus() != null) {
            auction.setStatus(AuctionStatus.valueOf(request.getStatus().toUpperCase()));
        }
        if (request.getBidCount() != null) {
            auction.setBidCount(request.getBidCount());
        }

        Auction saved = auctionRepository.save(auction);

        AuctionResponseDTO response = auctionMapper.mapToResponseDTO(saved);
        response.setUser(seller);

        System.out.println("🔥 === END createAuction SUCCESS ===");
        return response;
    }

    @Retryable(value = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public AuctionResponseDTO updateAuction(Long id, AuctionRequestDTO request, Long requesterId) {
        System.out.println("🔥 === START updateAuction ===");

        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + id));

        if (auction.getStartTime().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Cannot update auction that has already started.");
        }

        if (requesterId == null) {
            throw new IllegalArgumentException("Seller ID is required");
        }

        UserDTO seller = userClient.getUserById(requesterId);
        if (!isUserVerified(seller)) {
            throw new IllegalArgumentException("Seller not verified or does not exist. Citizen ID must be approved to update auctions.");
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
            auction.setStatus(AuctionStatus.valueOf(request.getStatus().toUpperCase()));
        }
        if (request.getBidCount() != null) {
            auction.setBidCount(request.getBidCount());
        }

        Auction updated = auctionRepository.save(auction);

        AuctionResponseDTO response = auctionMapper.mapToResponseDTO(updated);
        response.setUser(seller);

        System.out.println("🔥 === END updateAuction SUCCESS ===");
        return response;
    }

    public void updateCurrentBid(Long auctionId, BigDecimal currentBid, Integer bidCount) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new RuntimeException("Auction not found"));

        auction.setCurrentBid(currentBid);
        auction.setBidCount(bidCount);

        auctionRepository.save(auction);
    }

    @Retryable(value = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    @Override
    public AuctionResponseDTO updateAuctionStatus(Long id, String status, Long requesterId) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + id));

        UserDTO requester = userClient.getUserById(requesterId);
        if (requester == null) {
            throw new IllegalArgumentException("User not found with id: " + requesterId);
        }

        boolean isAdmin = requester.getRoles() != null && requester.getRoles().contains("ADMIN");
        boolean isOwner = auction.getSellerId().equals(requesterId);
        if (!isAdmin && !isOwner) {
            throw new IllegalArgumentException("You don't have permission to update this auction status");
        }

        AuctionStatus newStatus = AuctionStatus.valueOf(status.toUpperCase());
        auction.setStatus(newStatus);

        Auction updated = auctionRepository.save(auction);

        AuctionResponseDTO response = auctionMapper.mapToResponseDTO(updated);
        response.setUser(requester);

        return response;
    }

    @Retryable(value = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public AuctionResponseDTO updateWinner(Long auctionId, Long winnerId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));

        LocalDateTime now = LocalDateTime.now();
        boolean ended = auction.getEndTime() != null && auction.getEndTime().isBefore(now);

        if (!ended) {
            throw new IllegalStateException("Cannot update winner until auction ends.");
        }

        auction.setWinnerId(winnerId);
        auction.setWinnerPaymentDeadline(now.plusDays(1));
        auction.setUpdatedAt(now);

        Auction saved = auctionRepository.save(auction);

        try {
            UserDTO winner = userClient.getUserById(winnerId);
            if (winner == null) return auctionMapper.mapToResponseDTO(saved);

            String winnerEmail = winner.getEmail();
            if (winnerEmail == null || winnerEmail.isBlank()) return auctionMapper.mapToResponseDTO(saved);

            String imageUrl = mediaService.getMainImageUrlByAuctionId(auctionId);
            if (imageUrl == null) {
                imageUrl = baseUrl + "/static/default-auction.png";
            }

            double finalPrice = auction.getCurrentBid() != null ? auction.getCurrentBid().doubleValue() : 0.0;

            AuctionWinEmailRequest emailRequest = new AuctionWinEmailRequest(
                    winnerEmail,
                    auction.getTitle(),
                    String.valueOf(auction.getId()),
                    imageUrl,
                    finalPrice
            );

            emailClient.sendAuctionWinnerEmail(emailRequest);
            System.out.println("✅ Email gửi thành công tới winner: " + winnerEmail);

        } catch (Exception e) {
            System.err.println("❌ LỖI gửi email winner: " + e.getMessage());
        }

        AuctionResponseDTO response = auctionMapper.mapToResponseDTO(saved);
        response.setUser(userClient.getUserById(saved.getSellerId()));
        return response;
    }

    public AuctionResponseDTO confirmPayment(Long auctionId, String paymentId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));

        if (auction.getStatus() != AuctionStatus.CLOSED) {
            throw new IllegalStateException("Can only confirm payment for CLOSED auctions. Current status: " + auction.getStatus());
        }

        if (auction.getWinnerId() == null) {
            throw new IllegalStateException("Cannot confirm payment - no winner found");
        }

        LocalDateTime now = LocalDateTime.now();
        if (auction.getWinnerPaymentDeadline() != null && auction.getWinnerPaymentDeadline().isBefore(now)) {
            throw new IllegalStateException("Payment deadline has passed");
        }

        auction.setStatus(AuctionStatus.SOLD);
        auction.setUpdatedAt(now);

        Auction saved = auctionRepository.save(auction);

        System.out.println("Payment confirmed for auction " + auctionId +
                " - Status changed to SOLD (PaymentId: " + paymentId + ")");

        return auctionMapper.mapToResponseDTO(saved);
    }

    public List<Auction> getAllAuctions() {
        return auctionRepository.findAll();
    }

    public Optional<Auction> getAuctionById(Long id) {
        return auctionRepository.findById(id);
    }

    public List<Auction> findAuctionsByCategory(Long categoryId) {
        return auctionRepository.findByCategoryId(categoryId);
    }

    public List<Auction> findAuctionsByStatus(AuctionStatus status) {
        return auctionRepository.findByStatus(status);
    }

    public List<Auction> getAuctionsBySellerIdRaw(Long sellerId) {
        return auctionRepository.findBySellerId(sellerId);
    }

    @Override
    public List<AuctionResponseDTO> getAuctionsBySellerId(Long sellerId) {
        List<Auction> auctions = auctionRepository.findBySellerId(sellerId);
        return auctionMapper.mapToResponseDTOList(auctions);
    }

    @Retryable(value = Exception.class, maxAttempts = 3, backoff = @Backoff(delay = 2000))
    public void deleteAuction(Long auctionId, Long requesterId) {
        Auction auction = auctionRepository.findById(auctionId)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + auctionId));

        UserDTO requester;
        try {
            requester = userClient.getUserById(requesterId);
            if (requester == null) {
                throw new IllegalArgumentException("User not found");
            }
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to verify requester identity", ex);
        }

        boolean isAdmin = requester.getRoles() != null && requester.getRoles().contains("ADMIN");
        boolean isOwner = auction.getSellerId().equals(requesterId);

        if (!isAdmin && !isOwner) {
            throw new IllegalArgumentException("You don't have permission to delete this auction");
        }

        auctionRepository.delete(auction);
    }

    @Deprecated
    public AuctionResponseDTO mapToResponseDTO(Auction auction) {
        return auctionMapper.mapToResponseDTO(auction);
    }

    public Auction save(Auction auction) {
        return auctionRepository.save(auction);
    }
}
