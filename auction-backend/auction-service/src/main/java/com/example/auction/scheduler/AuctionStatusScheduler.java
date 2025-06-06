package com.example.auction.scheduler;

import com.example.auction.client.BidServiceClient;
import com.example.auction.model.Auction;
import com.example.auction.model.AuctionStatus;
import com.example.auction.repository.AuctionRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class AuctionStatusScheduler {

    private static final Logger logger = LoggerFactory.getLogger(AuctionStatusScheduler.class);

    private final AuctionRepository auctionRepository;
    private final BidServiceClient bidServiceClient;

    @Autowired
    public AuctionStatusScheduler(AuctionRepository auctionRepository, BidServiceClient bidServiceClient) {
        this.auctionRepository = auctionRepository;
        this.bidServiceClient = bidServiceClient;
    }

    @Scheduled(fixedRate = 10000) // reload every 10 seconds
    @Transactional
    public void updateAuctionStatuses() {
        LocalDateTime now = LocalDateTime.now();
        logger.info("Running AuctionStatusScheduler at {}", now);

        // Mở auction đúng giờ
        List<Auction> toOpen = auctionRepository.findByStatusAndStartTimeBeforeAndEndTimeAfter(
                AuctionStatus.UPCOMING, now, now);
        toOpen.forEach(a -> {
            a.setStatus(AuctionStatus.OPENED);
            logger.info("Auction {} moved from UPCOMING to OPENED", a.getId());
        });
        auctionRepository.saveAll(toOpen);

        // Đóng auction đã hết giờ
        List<Auction> toClose = auctionRepository.findByStatusAndEndTimeBefore(AuctionStatus.OPENED, now);

        toClose.forEach(a -> {
            a.setStatus(AuctionStatus.CLOSED);
            try {
                BidServiceClient.WinnerInfo winnerInfo = bidServiceClient.getWinnerByAuctionId(a.getId());
                if (winnerInfo != null && winnerInfo.getUserId() != null) {
                    a.setWinnerId(winnerInfo.getUserId());
                    a.setWinnerPaymentDeadline(now.plusDays(3));
                    logger.info("Auction {} closed with winner: {}", a.getId(), winnerInfo.getUserId());
                } else {
                    logger.info("Auction {} closed with no winner (no bids)", a.getId());
                }
            } catch (Exception e) {
                logger.error("Failed to get winner info for auction {}: {}", a.getId(), e.getMessage());
            }

            logger.info("Auction {} moved from OPENED to CLOSED", a.getId());
        });

        auctionRepository.saveAll(toClose);
    }
}
