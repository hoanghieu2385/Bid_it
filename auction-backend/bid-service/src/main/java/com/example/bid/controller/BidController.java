package com.example.bid.controller;

import com.example.bid.model.Bid;
import com.example.bid.service.BidService;
import com.example.bid.dto.BidMessageDTO;
import com.example.bid.messaging.BidProducer;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import com.example.bid.dto.UserBidGroupDTO;

import java.util.List;

@RestController
@RequestMapping("/api/bids")
public class BidController {

    private final BidService bidService;
    private final BidProducer bidProducer;

    public BidController(BidService bidService, BidProducer bidProducer) {
        this.bidService = bidService;
        this.bidProducer = bidProducer;
    }

    @GetMapping("/auction/{auctionId}")
    public List<Bid> getBidsByAuction(@PathVariable Long auctionId) {
        return bidService.getBidsByAuction(auctionId);
    }

    @GetMapping("/auction/{auctionId}/count")
    public long countBids(@PathVariable Long auctionId) {
        return bidService.countBidsForAuction(auctionId);
    }

    @GetMapping("/highest/{auctionId}")
    public Bid getHighestBid(@PathVariable Long auctionId) {
        return bidService.getHighestBid(auctionId);
    }

    @GetMapping("/user/{userId}")
    public List<Bid> getBidsByUser(@PathVariable Long userId) {
        return bidService.getBidsByUser(userId);
    }

    @GetMapping("/user/{userId}/grouped")
    public List<UserBidGroupDTO> getGroupedBidsByUser(@PathVariable Long userId) {
        return bidService.getGroupedBidsByUser(userId);
    }

    @PostMapping
    public Bid placeBid(@Valid @RequestBody Bid bid) {
        return bidService.placeBid(bid);
    }

    @PostMapping("/async")
    public ResponseEntity<String> placeBid(@RequestBody BidMessageDTO bidMessage) {
        bidProducer.sendBid(bidMessage);
        return ResponseEntity.accepted().body("Bid submitted for processing.");
    }

    @DeleteMapping("/cancel/{bidId}")
    public Bid cancelBid(@PathVariable Long bidId) {
        return bidService.cancelBid(bidId);
    }

}
