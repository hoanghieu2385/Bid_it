package com.example.auction.scheduler;

import com.example.auction.client.UserClient;
import com.example.auction.model.Auction;
import com.example.auction.model.AuctionStatus;
import com.example.auction.repository.AuctionRepository;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
public class AuctionPaymentScheduler {

    private static final org.slf4j.Logger logger = org.slf4j.LoggerFactory.getLogger(AuctionPaymentScheduler.class);

    private final AuctionRepository auctionRepository;
    private final UserClient userServiceClient;

    public AuctionPaymentScheduler(AuctionRepository auctionRepository, UserClient userServiceClient) {
        this.auctionRepository = auctionRepository;
        this.userServiceClient = userServiceClient;
    }

    @Scheduled(fixedRate = 3600000)
    public void checkExpiredPayments() {
        LocalDateTime now = LocalDateTime.now();

        List<Auction> expiredAuctions = auctionRepository
                .findByStatusAndWinnerPaymentDeadlineBefore(AuctionStatus.CLOSED, now);

        for (Auction auction : expiredAuctions) {
            try {
                Long winnerId = auction.getWinnerId();
                if (winnerId != null) {
                    userServiceClient.deductScore(winnerId, 10);
                }

                auction.setStatus(AuctionStatus.EXPIRED_PAYMENT);
                auctionRepository.save(auction);

                logger.info("Update auction #{} to EXPIRED_PAYMENT, deduct user score #{}", auction.getId(), winnerId);
            } catch (Exception e) {
                logger.error("Error while processing auction #{}: {}", auction.getId(), e.getMessage());
            }
        }
    }
}
