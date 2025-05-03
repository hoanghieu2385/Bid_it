package com.example.bid.controller;

import com.example.bid.model.Bid;
import com.example.bid.service.BidService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bids")
public class BidController {

    private final BidService bidService;

    public BidController(BidService bidService) {
        this.bidService = bidService;
    }

    @GetMapping("/auction/{auctionId}")
    public List<Bid> getBidsByAuction(@PathVariable Long auctionId) {
        return bidService.getBidsByAuction(auctionId);
    }

    @PostMapping
    public Bid placeBid(@Valid @RequestBody Bid bid) {
        return bidService.placeBid(bid);
    }

    @GetMapping("/highest/{auctionId}")
    public Bid getHighestBid(@PathVariable Long auctionId) {
        return bidService.getHighestBid(auctionId);
    }

    @GetMapping("/user/{userId}")
    public List<Bid> getBidsByUser(@PathVariable Long userId) {
        return bidService.getBidsByUser(userId);
    }

    @DeleteMapping("/{bidId}")
    public Bid cancelBid(@PathVariable Long bidId) {
        return bidService.cancelBid(bidId);
    }

    @GetMapping("/auction/{auctionId}/count")
    public long countBids(@PathVariable Long auctionId) {
        return bidService.countBidsForAuction(auctionId);
    }

}
