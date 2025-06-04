package com.example.auction.scheduler;

import com.example.auction.model.Auction;
import com.example.auction.model.AuctionStatus;
import com.example.auction.repository.AuctionRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class AuctionStatusScheduler {

    private static final Logger logger = LoggerFactory.getLogger(AuctionStatusScheduler.class);

    private final AuctionRepository auctionRepository;

    public AuctionStatusScheduler(AuctionRepository auctionRepository) {
        this.auctionRepository = auctionRepository;
    }

    // Chạy mỗi 1 phút
    @Scheduled(fixedRate = 60000)
    @Transactional
    public void updateAuctionStatuses() {
        LocalDateTime now = LocalDateTime.now();
        logger.info("Running AuctionStatusScheduler at {}", now);

        // 1. UPCOMING -> OPENED
        List<Auction> toOpen = auctionRepository.findByStatusAndStartTimeBeforeAndEndTimeAfter(
                AuctionStatus.UPCOMING, now, now);
        toOpen.forEach(a -> {
            a.setStatus(AuctionStatus.OPENED);
            logger.info("Auction {} moved from UPCOMING to OPENED", a.getId());
        });
        auctionRepository.saveAll(toOpen);

        // 2. OPENED -> CLOSED
        List<Auction> toClose = auctionRepository.findByStatusAndEndTimeBefore(
                AuctionStatus.OPENED, now);
        toClose.forEach(a -> {
            a.setStatus(AuctionStatus.CLOSED);
            logger.info("Auction {} moved from OPENED to CLOSED", a.getId());
        });
        auctionRepository.saveAll(toClose);
    }
}
