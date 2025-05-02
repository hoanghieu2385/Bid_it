package com.example.bid.service;

import com.example.bid.dto.AuctionDTO;
import com.example.bid.model.Bid;
import com.example.bid.repository.BidRepository;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class BidService {

    private final BidRepository bidRepository;
    private final RestTemplate restTemplate;

    public BidService(BidRepository bidRepository, RestTemplate restTemplate) {
        this.bidRepository = bidRepository;
        this.restTemplate = restTemplate;
    }

    public List<Bid> getBidsByAuction(Long auctionId) {
        return bidRepository.findByAuctionId(auctionId);
    }

    public Bid placeBid(Bid bid) {
        bid.setCreatedAt(LocalDateTime.now());

        // 🔄 Fetch auction details from auction-service
        AuctionDTO auction = restTemplate.getForObject(
                "http://auction-service/api/auctions/" + bid.getAuctionId(),
                AuctionDTO.class
        );

        // ❌ Auction not active?
        if (!"ACTIVE".equalsIgnoreCase(auction.getStatus())) {
            throw new IllegalArgumentException("Cannot place bid. Auction is not active.");
        }

        // ❌ Auction ended?
        if (auction.getEndTime().isBefore(LocalDateTime.now())) {
            throw new IllegalArgumentException("Cannot place bid. Auction has ended.");
        }

        // ❌ Bid not higher than current?
        BigDecimal current = auction.getCurrentBid() != null ? auction.getCurrentBid() : auction.getStartingPrice();
        if (bid.getAmount().compareTo(current) <= 0) {
            throw new IllegalArgumentException("Your bid must be higher than the current bid.");
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
}
