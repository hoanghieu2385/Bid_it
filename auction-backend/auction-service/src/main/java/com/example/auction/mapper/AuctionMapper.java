package com.example.auction.mapper;

import com.example.auction.client.UserClient;
import com.example.auction.dto.AuctionResponseDTO;
import com.example.auction.dto.MediaResponseDTO;
import com.example.auction.dto.UserDTO;
import com.example.auction.model.Auction;
import com.example.auction.service.MediaService;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AuctionMapper {

    private final MediaService mediaService;
    private final UserClient userClient; // Direct dependency instead of AuctionService

    public AuctionMapper(MediaService mediaService, UserClient userClient) {
        this.mediaService = mediaService;
        this.userClient = userClient;
    }

    /**
     * Maps Auction entity to AuctionResponseDTO with full media and user information
     * @param auction The auction entity to map
     * @return Complete AuctionResponseDTO with media and user data
     */
    public AuctionResponseDTO mapToResponseDTO(Auction auction) {
        // Load media for this auction
        List<MediaResponseDTO> mediaList = mediaService.getMediaByAuctionId(auction.getId());

        // Find thumbnail URL
        String thumbnailUrl = mediaList.stream()
                .filter(media -> Boolean.TRUE.equals(media.getIsThumbnail()))
                .map(MediaResponseDTO::getUrl)
                .findFirst()
                .orElse(null);

        // Get seller information directly from UserClient
        UserDTO seller = getSellerInfo(auction.getSellerId());

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

    /**
     * Maps a list of Auction entities to AuctionResponseDTO list
     * @param auctions List of auction entities
     * @return List of complete AuctionResponseDTO
     */
    public List<AuctionResponseDTO> mapToResponseDTOList(List<Auction> auctions) {
        return auctions.stream()
                .map(this::mapToResponseDTO)
                .toList(); // Java 16+ or use .collect(Collectors.toList()) for older versions
    }

    /**
     * Maps Auction entity to AuctionResponseDTO without loading additional data (lightweight)
     * Use this for performance-critical operations where media/user data is not needed
     * @param auction The auction entity to map
     * @return Basic AuctionResponseDTO without media and user data
     */
    public AuctionResponseDTO mapToBasicResponseDTO(Auction auction) {
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
                .media(null)
                .thumbnailUrl(null)
                .user(null)
                .build();
    }

    /**
     * Get seller info via UserClient - moved from AuctionService to break circular dependency
     * @param sellerId The seller's user ID
     * @return UserDTO or null if not found
     */
    private UserDTO getSellerInfo(Long sellerId) {
        try {
            return userClient.getUserById(sellerId);
        } catch (Exception e) {
            return null;
        }
    }
}