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

        try {
            // 1. UPCOMING → OPENED: if start time has passed and end time hasn't passed yet
            updateUpcomingToOpened(now);

            // 2. OPENED → CLOSED: if end time has passed
            updateOpenedToClosed(now);

            // 3. CLOSED → FAILED: if payment deadline has passed and no payment
            updateClosedToFailed(now);

            // NOTE: CLOSED → SOLD sẽ được xử lý khi có API thanh toán
            // Không tự động chuyển sang SOLD vì cần xác nhận thanh toán thực tế

        } catch (Exception e) {
            logger.error("Error in AuctionStatusScheduler: ", e);
        }
    }

    private void updateUpcomingToOpened(LocalDateTime now) {
        List<Auction> toOpen = auctionRepository.findByStatusAndStartTimeBeforeAndEndTimeAfter(
                AuctionStatus.UPCOMING, now, now);

        if (!toOpen.isEmpty()) {
            toOpen.forEach(auction -> {
                auction.setStatus(AuctionStatus.OPENED);
                auction.setUpdatedAt(now);
                logger.info("Auction {} moved from UPCOMING to OPENED", auction.getId());
            });
            auctionRepository.saveAll(toOpen);
            logger.info("Updated {} auctions from UPCOMING to OPENED", toOpen.size());
        }
    }

    private void updateOpenedToClosed(LocalDateTime now) {
        List<Auction> toClose = auctionRepository.findByStatusAndEndTimeBefore(AuctionStatus.OPENED, now);

        if (!toClose.isEmpty()) {
            toClose.forEach(auction -> {
                auction.setStatus(AuctionStatus.CLOSED);
                auction.setUpdatedAt(now);

                // Set payment deadline (3 days from now) - sẽ được cập nhật winner bởi bid-service
                auction.setWinnerPaymentDeadline(now.plusDays(3));

                logger.info("Auction {} moved from OPENED to CLOSED (winner will be updated by bid-service)", auction.getId());
            });

            auctionRepository.saveAll(toClose);
            logger.info("Updated {} auctions from OPENED to CLOSED", toClose.size());
        }
    }

    /**
     * Chuyển CLOSED → FAILED nếu quá hạn thanh toán
     */
    private void updateClosedToFailed(LocalDateTime now) {
        // Tìm các auction CLOSED có payment deadline đã qua
        List<Auction> expiredPayments = auctionRepository.findByStatusAndWinnerPaymentDeadlineBefore(
                AuctionStatus.CLOSED, now);

        if (!expiredPayments.isEmpty()) {
            logger.info("Found {} CLOSED auctions with expired payment deadline", expiredPayments.size());

            expiredPayments.forEach(auction -> {
                auction.setStatus(AuctionStatus.FAILED);
                auction.setUpdatedAt(now);
                logger.info("Auction {} moved from CLOSED to FAILED due to payment timeout (winnerId: {})",
                        auction.getId(), auction.getWinnerId());
            });

            auctionRepository.saveAll(expiredPayments);
            logger.info("Successfully updated {} auctions from CLOSED to FAILED", expiredPayments.size());
        }
    }

}