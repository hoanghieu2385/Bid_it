package com.example.auction.controller;

import com.example.auction.model.Auction;
import com.example.auction.service.AuctionService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/auctions")
public class AuctionController {

    private final AuctionService auctionService;

    @Autowired
    public AuctionController(AuctionService auctionService) {
        this.auctionService = auctionService;
    }

    @PostMapping
    public Auction createAuction(@RequestBody Auction auction) {
        return auctionService.createAuction(auction);
    }

    @GetMapping
    public List<Auction> getAuctions() {
        return auctionService.getAllAuctions();
    }

    @GetMapping("/{id}")
    public Optional<Auction> getAuction(@PathVariable Long id) {
        return auctionService.getAuctionById(id);
    }
}
