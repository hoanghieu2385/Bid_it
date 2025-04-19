package com.example.auction.service;

import com.example.auction.exception.ResourceNotFoundException;
import com.example.auction.model.Auction;
import com.example.auction.model.AuctionStatus;
import com.example.auction.repository.AuctionRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class AuctionService {

    private final AuctionRepository auctionRepository;

    @Autowired
    public AuctionService(AuctionRepository auctionRepository) {
        this.auctionRepository = auctionRepository;
    }

    public Auction createAuction(Auction auction) {
        return auctionRepository.save(auction);
    }

    public List<Auction> getAllAuctions() {
        return auctionRepository.findAll();
    }

    public Optional<Auction> getAuctionById(Long id) {
        return auctionRepository.findById(id);
    }

    public Auction updateAuction(Auction auction) {
        return auctionRepository.save(auction);
    }

    public void deleteAuction(Long id) {
        Auction auction = auctionRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Auction not found with id: " + id));

        // Soft delete by setting the deletedAt timestamp
        auction.setDeletedAt(LocalDateTime.now());
        auctionRepository.save(auction);
    }

    public List<Auction> findAuctionsByStatus(AuctionStatus status) {
        return auctionRepository.findByStatus(status);
    }

    public List<Auction> findAuctionsByCategory(Long categoryId) {
        return auctionRepository.findByCategoryId(categoryId);
    }

}
