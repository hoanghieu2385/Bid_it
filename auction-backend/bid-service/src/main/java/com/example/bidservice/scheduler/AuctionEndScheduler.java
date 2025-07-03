package com.example.bidservice.scheduler;

import com.example.bidservice.client.AuctionServiceClient;
import com.example.bidservice.service.BidMessagePublisher;
import com.example.bidservice.service.IBidService;
import com.example.bidservice.repository.BidRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Set;
import java.util.HashSet;

@Component
public class AuctionEndScheduler {

    @Autowired
    private IBidService bidService;

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private AuctionServiceClient auctionServiceClient;

    @Autowired
    private BidMessagePublisher bidMessagePublisher;

    // Set để track những auction đã được xử lý
    private final Set<Long> processedAuctions = new HashSet<>();

    // Chạy mỗi 5s để tìm auction đã kết thúc
    @Scheduled(fixedRate = 5000)
    public void checkEndedAuctions() {
        try {
            System.out.println("Checking for ended auctions at: " + LocalDateTime.now());

            List<Long> auctionIdsWithBids = bidRepository.findDistinctAuctionIds();

            for (Long auctionId : auctionIdsWithBids) {

                if (processedAuctions.contains(auctionId)) {
                    continue;
                }

                try {
                    AuctionServiceClient.AuctionResponse auction = auctionServiceClient.getAuctionById(auctionId);
                    if (auction == null) continue;

                    boolean isEndedByTime = auction.getEndTime() != null && auction.getEndTime().isBefore(LocalDateTime.now());
                    boolean isClosedStatus = "CLOSED".equals(auction.getStatus());
                    boolean isEndedStatus = "ENDED".equals(auction.getStatus());
                    boolean isFailedStatus = "FAILED".equals(auction.getStatus());

                    if (isEndedByTime || isClosedStatus || isEndedStatus || isFailedStatus) {
                        System.out.println("Found ended auction: " + auctionId +
                                " (time ended: " + isEndedByTime +
                                ", status: " + auction.getStatus() + ")");

                        if (auction.getWinnerId() == null) {
                            System.out.println("Publishing auction end event for auction " + auctionId);

                            bidMessagePublisher.publishAuctionEnd(auctionId, "TIME_EXPIRED");

                            processedAuctions.add(auctionId);
                        } else {
                            processedAuctions.add(auctionId);
                            System.out.println("Auction " + auctionId + " already has winner: " + auction.getWinnerId());
                        }
                    }

                } catch (Exception e) {
                    System.err.println("Error processing auction " + auctionId + ": " + e.getMessage());
                }
            }

        } catch (Exception e) {
            System.err.println("Error in auction end scheduler: " + e.getMessage());
        }
    }

    // Dọn bộ nhớ cache processedAuctions mỗi giờ
    @Scheduled(fixedRate = 3600000) // 1 giờ
    public void cleanupProcessedAuctions() {
        try {
            System.out.println("Cleaning up processed auctions cache");

            // Có thể implement logic để chỉ xóa những auction đã cũ
            // Hoặc limit size của Set
            if (processedAuctions.size() > 1000) {
                processedAuctions.clear();
                System.out.println("Cleared processed auctions cache");
            }

        } catch (Exception e) {
            System.err.println("Error cleaning up processed auctions: " + e.getMessage());
        }
    }
}
