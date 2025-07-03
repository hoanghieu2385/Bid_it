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

    @Autowired
    public AuctionStatusScheduler(AuctionRepository auctionRepository,
                                  BidServiceClient bidServiceClient,
                                  UserClient userClient,
                                  EmailClient emailClient,
                                  MediaRepository mediaRepository, BidMessagePublisher bidMessagePublisher) {
        this.auctionRepository = auctionRepository;
        this.bidServiceClient = bidServiceClient;
        this.userClient = userClient;
        this.emailClient = emailClient;
        this.mediaRepository = mediaRepository;
        this.bidMessagePublisher = bidMessagePublisher;
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
                // Cập nhật status và deadline
                auction.setStatus(AuctionStatus.CLOSED);
                auction.setUpdatedAt(now);
                auction.setWinnerPaymentDeadline(now.plusDays(1)); // 1 ngày để thanh toán

                logger.info("Auction {}: OPENED → CLOSED", auction.getId());

                // Xử lý kết thúc đấu giá trong bid-service
                bidMessagePublisher.publishAuctionEnd(auction.getId(), "TIME_EXPIRED");

                // Gửi email cho winner nếu có
//                sendWinnerEmailIfExists(auction);

            } catch (Exception e) {
                logger.error("Error processing auction end for auction {}: {}", auction.getId(), e.getMessage());
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

    /**
     * Gửi email thông báo thắng đấu giá cho winner
     */
    private void sendWinnerEmailIfExists(Auction auction) {
        try {
            // Kiểm tra có winner không
            if (auction.getWinnerId() == null) {
                logger.info("Auction {} has no winner, skipping email", auction.getId());
                return;
            }

            // Lấy thông tin user
            UserDTO winner = userClient.getUserById(auction.getWinnerId());
            if (winner == null || winner.getEmail() == null) {
                logger.warn("Cannot get winner email for auction {} and user {}",
                        auction.getId(), auction.getWinnerId());
                return;
            }

            // Lấy thông tin bid từ bid-service
            BidServiceClient.WinnerResponse winnerInfo = bidServiceClient.getWinnerByAuctionId(auction.getId());
            if (winnerInfo == null || winnerInfo.getBidAmount() == null) {
                logger.warn("Cannot get winner bid info for auction {}", auction.getId());
                return;
            }

            // Tạo request gửi email cho winner
            Media thumbnail = mediaRepository.findThumbnailByAuctionId(auction.getId());

            if (thumbnail == null) {
                thumbnail = mediaRepository.findFirstByAuctionIdOrderByIdAsc(auction.getId());
            }

            String imageUrl = (thumbnail != null) ? thumbnail.getUrl() : null;

            AuctionWinEmailRequest emailRequest = new AuctionWinEmailRequest(
                    winner.getEmail(),
                    auction.getTitle(),
                    auction.getSlug() != null ? auction.getSlug() : auction.getId().toString(),
                    imageUrl,
                    Double.parseDouble(winnerInfo.getBidAmount())
            );

            // Gửi email
            emailClient.sendAuctionWinnerEmail(emailRequest);

            logger.info("✅ Sent winner email for auction {} to user {} ({})",
                    auction.getId(), auction.getWinnerId(), winner.getEmail());

        } catch (Exception e) {
            logger.error("❌ Failed to send winner email for auction {}: {}",
                    auction.getId(), e.getMessage());
            // Không throw exception để không làm fail toàn bộ quá trình
        }
    }
}