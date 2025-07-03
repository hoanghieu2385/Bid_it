package com.example.auction.mapper;

import com.example.auction.dto.AuctionResponseDTO;
import com.example.auction.dto.MediaResponseDTO;
import com.example.auction.model.Auction;
import com.example.auction.service.MediaService;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
public class AuctionMapper {

    private final MediaService mediaService;

    public AuctionMapper(MediaService mediaService) {
        this.mediaService = mediaService;
    }

    public AuctionResponseDTO mapToResponseDTO(Auction auction) {
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
                .user(null) // Không gọi Feign trong mapper nữa!
                .build();
    }

    public List<AuctionResponseDTO> mapToResponseDTOList(List<Auction> auctions) {
        return auctions.stream()
                .map(this::mapToResponseDTO)
                .toList();
    }
}
