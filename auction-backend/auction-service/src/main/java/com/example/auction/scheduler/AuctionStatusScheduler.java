package com.example.auction.scheduler;

import com.example.auction.client.BidServiceClient;
import com.example.auction.client.UserClient;
import com.example.auction.client.EmailClient;
import com.example.auction.dto.AuctionWinEmailRequest;
import com.example.auction.dto.UserDTO;
import com.example.auction.model.Auction;
import com.example.auction.model.AuctionStatus;
import com.example.auction.model.Media;
import com.example.auction.publisher.BidMessagePublisher;
import com.example.auction.repository.AuctionRepository;
import com.example.auction.repository.MediaRepository;
import com.example.auction.service.AuctionService;
import jakarta.transaction.Transactional;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Profile;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Component
//@Profile("!dev") // nếu bạn chỉ muốn chạy scheduler trên môi trường non-dev
public class AuctionStatusScheduler {

    private static final Logger logger = LoggerFactory.getLogger(AuctionStatusScheduler.class);

    private final AuctionRepository auctionRepository;
    private final BidServiceClient bidServiceClient;
    private final UserClient userClient;
    private final EmailClient emailClient;
    private final MediaRepository mediaRepository;
    private final BidMessagePublisher bidMessagePublisher;
    private final AuctionService auctionService;

    @Autowired
    public AuctionStatusScheduler(AuctionRepository auctionRepository,
                                  BidServiceClient bidServiceClient,
                                  UserClient userClient,
                                  EmailClient emailClient,
                                  MediaRepository mediaRepository, BidMessagePublisher bidMessagePublisher, AuctionService auctionService) {
        this.auctionRepository = auctionRepository;
        this.bidServiceClient = bidServiceClient;
        this.userClient = userClient;
        this.emailClient = emailClient;
        this.mediaRepository = mediaRepository;
        this.bidMessagePublisher = bidMessagePublisher;
        this.auctionService = auctionService;
    }

    // Tăng tần suất từ 30s thành 10s
    @Scheduled(fixedRate = 10000)
    @Transactional
    public void updateAuctionStatuses() {
        LocalDateTime now = LocalDateTime.now();
        boolean hasChanges = false;

        try {
            hasChanges |= openUpcomingAuctions(now);
            hasChanges |= closeEndedAuctions(now);
            hasChanges |= handleExpiredPayments(now); // Gộp logic xử lý expired payment

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
        LocalDateTime buffer = now.minusSeconds(5);
        List<Auction> toClose = auctionRepository.findByStatusAndEndTimeBefore(AuctionStatus.OPENED, buffer);

        if (toClose.isEmpty()) return false;

        for (Auction auction : toClose) {
            try {
                // 1) Cập nhật status & thời hạn thanh toán
                auction.setStatus(AuctionStatus.CLOSED);
                auction.setUpdatedAt(now);
                auction.setWinnerPaymentDeadline(now.plusDays(1));

                logger.info("Auction {}: OPENED → CLOSED", auction.getId());

                // 2) Tìm winner
                BidServiceClient.WinnerResponse winner = bidServiceClient.getWinnerByAuctionId(auction.getId());
                if (winner != null && winner.getUserId() != null) {
                    logger.info("🏆 Winner found for auction {}: userId={} bidAmount={}",
                            auction.getId(), winner.getUserId(), winner.getBidAmount());

                    // 3) GỌI updateWinner: tự lưu winnerId + gửi email
                    auctionService.updateWinner(auction.getId(), winner.getUserId());

                } else {
                    logger.info("❌ No winner found for auction {}", auction.getId());
                }

            } catch (Exception e) {
                logger.error("❌ Error processing auction {}: {}", auction.getId(), e.getMessage());
            }
        }

        auctionRepository.saveAll(toClose);
        logger.info("Closed {} auctions", toClose.size());
        return true;
    }

    private boolean handleExpiredPayments(LocalDateTime now) {
        List<Auction> expiredAuctions = auctionRepository
                .findByStatusAndWinnerPaymentDeadlineBefore(AuctionStatus.CLOSED, now);

        if (expiredAuctions.isEmpty()) return false;

        boolean hasChanges = false;

        for (Auction auction : expiredAuctions) {
            try {
                if (auction.getWinnerId() != null) {
                    // Có winner nhưng không thanh toán đúng hạn
                    userClient.deductScore(auction.getWinnerId(), 10);
                    auction.setStatus(AuctionStatus.EXPIRED_PAYMENT);
                    auction.setUpdatedAt(now);

                    logger.info("Auction {}: CLOSED → EXPIRED_PAYMENT, deducted score for user {}",
                            auction.getId(), auction.getWinnerId());
                    hasChanges = true;

                } else {
                    // Không có winner nào
                    auction.setStatus(AuctionStatus.FAILED);
                    auction.setUpdatedAt(now);

                    logger.info("Auction {}: CLOSED → FAILED (no winner)", auction.getId());
                    hasChanges = true;
                }

            } catch (Exception e) {
                logger.error("Error processing expired auction {}: {}", auction.getId(), e.getMessage());
            }
        }

        if (hasChanges) {
            auctionRepository.saveAll(expiredAuctions);
            logger.info("Processed {} expired auctions", expiredAuctions.size());
        }

        return hasChanges;
    }
}