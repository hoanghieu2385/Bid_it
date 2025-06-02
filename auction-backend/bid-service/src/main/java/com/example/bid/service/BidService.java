package com.example.bid.service;

import com.example.bid.client.UserClient;
import com.example.bid.client.AuctionClient;
import com.example.bid.dto.UserDTO;
import com.example.bid.dto.AuctionDTO;
import com.example.bid.model.Bid;
import com.example.bid.repository.BidRepository;
import org.springframework.stereotype.Service;
import com.example.bid.dto.UserBidGroupDTO;
import com.example.bid.dto.BidDTO;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.ArrayList;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class BidService implements IBidService {

    private final UserClient userClient;
    private final AuctionClient auctionClient;
    private final BidRepository bidRepository;

    public BidService(UserClient userClient, AuctionClient auctionClient, BidRepository bidRepository) {
        this.userClient = userClient;
        this.auctionClient = auctionClient;
        this.bidRepository = bidRepository;
    }

    public List<Bid> getBidsByAuction(Long auctionId) {
        return bidRepository.findByAuctionId(auctionId);
    }

    public Bid placeBid(Bid bid) {
        bid.setCreatedAt(LocalDateTime.now());

        // Validate user
        UserDTO user = userClient.getUserById(bid.getBidderId());
        if (user == null || !Boolean.TRUE.equals(user.getVerified())) {
            throw new IllegalArgumentException("Bidder not verified or does not exist.");
        }

        // Fetch auction details from auction-service
        AuctionDTO auction = auctionClient.getAuctionById(bid.getAuctionId());

        // Seller cannot bid
        if (auction.getUserId().equals(bid.getBidderId())) {
            throw new IllegalArgumentException("Sellers cannot bid on their own auctions.");
        }

        // Auction not active?
        if (!"OPENED".equalsIgnoreCase(auction.getStatus())) {
            throw new IllegalArgumentException("Cannot place bid. Auction is not active.");
        }

        // Auction ended?
        if (auction.getEndTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Cannot place bid. Auction has ended.");
        }

        // Bid not higher than current?
        BigDecimal current = auction.getCurrentBid() != null ? auction.getCurrentBid() : auction.getStartingPrice();
        if (bid.getAmount().compareTo(current) <= 0) {
            throw new IllegalArgumentException("Your bid must be higher than the current bid.");
        }

        // Same user, same amount
        boolean alreadyPlacedSameBid = bidRepository.existsByAuctionIdAndBidderIdAndAmount(
                bid.getAuctionId(), bid.getBidderId(), bid.getAmount()
        );
        if (alreadyPlacedSameBid) {
            throw new IllegalArgumentException("You have already placed a bid with this amount.");
        }

        // Someone else already placed this exact bid first
        Bid existing = bidRepository.findTopByAuctionIdAndAmountOrderByCreatedAtAsc(
                bid.getAuctionId(), bid.getAmount()
        );
        if (existing != null && !existing.getBidderId().equals(bid.getBidderId())) {
            throw new IllegalArgumentException("This amount has already been bid. Please choose a higher amount.");
        }

        return bidRepository.save(bid);
    }

    public Bid getHighestBid(Long auctionId) {
        return bidRepository.findTopByAuctionIdOrderByAmountDesc(auctionId);
    }

    public List<Bid> getBidsByUser(Long bidderId) {
        return bidRepository.findByBidderId(bidderId);
    }

    public Bid cancelBid(Long bidId) {
        Bid bid = bidRepository.findById(bidId)
                .orElseThrow(() -> new RuntimeException("Bid not found"));
        bid.setCanceledAt(LocalDateTime.now());
        return bidRepository.save(bid);
    }

    public long countBidsForAuction(Long auctionId) {
        return bidRepository.countByAuctionId(auctionId);
    }

    public List<UserBidGroupDTO> getGroupedBidsByUser(Long userId) {
        List<Bid> userBids = bidRepository.findByBidderId(userId);

        // Group bids by auctionId
        Map<Long, List<Bid>> groupedByAuction = userBids.stream()
                .collect(Collectors.groupingBy(Bid::getAuctionId));

        List<UserBidGroupDTO> groupedResult = new ArrayList<>();

        for (Map.Entry<Long, List<Bid>> entry : groupedByAuction.entrySet()) {
            Long auctionId = entry.getKey();
            List<Bid> bidsForAuction = entry.getValue();

            // Fetch auction title from auction-service
            String auctionTitle = fetchAuctionTitle(auctionId);

            // Convert bids to BidDTO
            List<BidDTO> bidDTOs = bidsForAuction.stream().map(b -> {
                BidDTO dto = new BidDTO();
                dto.setAmount(b.getAmount());
                dto.setCreatedAt(b.getCreatedAt());
                return dto;
            }).collect(Collectors.toList());

            UserBidGroupDTO group = new UserBidGroupDTO();
            group.setAuctionId(auctionId);
            group.setAuctionTitle(auctionTitle);
            group.setBids(bidDTOs);

            groupedResult.add(group);
        }

        return groupedResult;
    }

    private String fetchAuctionTitle(Long auctionId) {
        try {
            AuctionDTO auction = auctionClient.getAuctionById(auctionId);
            return auction.getTitle();
        } catch (Exception e) {
            System.err.println("Failed to fetch auction title for ID " + auctionId + ": " + e.getMessage());
            return "Unknown Auction";
        }
    }

}
