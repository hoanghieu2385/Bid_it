package com.example.auction.scheduler;

import com.example.auction.client.BidServiceClient;
import com.example.auction.model.Auction;
import com.example.auction.model.AuctionStatus;
import com.example.auction.repository.AuctionRepository;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;

@Component
//@Profile("!dev") // nếu bạn chỉ muốn chạy scheduler trên môi trường non-dev
public class AuctionStatusScheduler {

    private static final Logger logger = LoggerFactory.getLogger(AuctionStatusScheduler.class);

    private final AuctionRepository auctionRepository;
    private final BidServiceClient bidServiceClient;

    @Autowired
    public AuctionStatusScheduler(AuctionRepository auctionRepository, BidServiceClient bidServiceClient) {
        this.auctionRepository = auctionRepository;
        this.bidServiceClient = bidServiceClient;
    }

    // Giảm tần suất từ 7s xuống 30s
    @Scheduled(fixedRate = 30000)
    @Transactional
    public void updateAuctionStatuses() {
        LocalDateTime now = LocalDateTime.now();
        boolean hasChanges = false;

        try {
            hasChanges |= openUpcomingAuctions(now);
            hasChanges |= closeEndedAuctions(now);
            hasChanges |= failUnpaidAuctions(now);

            if (hasChanges) {
                logger.info("AuctionStatusScheduler applied updates at {}", now);
            }
        } catch (Exception e) {
            logger.error("Error in AuctionStatusScheduler: ", e);
        }
    }

    private boolean openUpcomingAuctions(LocalDateTime now) {
        List<Auction> toOpen = auctionRepository.findByStatusAndStartTimeBeforeAndEndTimeAfter(
                AuctionStatus.UPCOMING, now, now);

        if (toOpen.isEmpty()) return false;

        toOpen.forEach(a -> {
            a.setStatus(AuctionStatus.OPENED);
            a.setUpdatedAt(now);
            logger.info("Auction {}: UPCOMING → OPENED", a.getId());
        });
        auctionRepository.saveAll(toOpen);
        logger.info("Opened {} auctions", toOpen.size());
        return true;
    }

    private boolean closeEndedAuctions(LocalDateTime now) {
        // thêm buffer 5s để chắc chắn endTime đã qua
        LocalDateTime buffer = now.minusSeconds(5);
        List<Auction> toClose = auctionRepository.findByStatusAndEndTimeBefore(AuctionStatus.OPENED, buffer);

        if (toClose.isEmpty()) return false;

        toClose.forEach(a -> {
            a.setStatus(AuctionStatus.CLOSED);
            a.setUpdatedAt(now);
            a.setWinnerPaymentDeadline(now.plusDays(3));
            logger.info("Auction {}: OPENED → CLOSED", a.getId());
        });
        auctionRepository.saveAll(toClose);
        logger.info("Closed {} auctions", toClose.size());
        return true;
    }

    private boolean failUnpaidAuctions(LocalDateTime now) {
        List<Auction> expired = auctionRepository.findByStatusAndWinnerPaymentDeadlineBefore(
                AuctionStatus.CLOSED, now);

        if (expired.isEmpty()) return false;

        expired.forEach(a -> {
            a.setStatus(AuctionStatus.FAILED);
            a.setUpdatedAt(now);
            logger.info("Auction {}: CLOSED → FAILED (no payment)", a.getId());
        });
        auctionRepository.saveAll(expired);
        logger.info("Marked {} auctions as FAILED", expired.size());
        return true;
    }
}
