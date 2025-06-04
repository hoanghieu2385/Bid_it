package com.example.bidservice.scheduler;

import com.example.bidservice.client.AuctionServiceClient;
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

    // Set để track những auction đã được xử lý
    private final Set<Long> processedAuctions = new HashSet<>();

    /**
     * Chạy mỗi phút để check auction nào đã kết thúc
     */
    @Scheduled(fixedRate = 60000) // 1 phút
    public void checkEndedAuctions() {
        try {
            System.out.println("Checking for ended auctions at: " + LocalDateTime.now());

            // Lấy danh sách auction IDs có bid nhưng chưa được xử lý
            List<Long> auctionIdsWithBids = bidRepository.findDistinctAuctionIds();

            for (Long auctionId : auctionIdsWithBids) {
                // Skip nếu đã xử lý rồi
                if (processedAuctions.contains(auctionId)) {
                    continue;
                }

                try {
                    // Lấy thông tin auction
                    AuctionServiceClient.AuctionResponse auction =
                            auctionServiceClient.getAuctionById(auctionId);

                    if (auction == null) {
                        continue;
                    }

                    // Check nếu auction đã kết thúc
                    boolean isEnded = auction.getEndTime() != null &&
                            auction.getEndTime().isBefore(LocalDateTime.now());

                    // Hoặc check theo status
                    boolean isClosedStatus = "CLOSED".equals(auction.getStatus()) ||
                            "ENDED".equals(auction.getStatus()) ||
                            "FAILED".equals(auction.getStatus());

                    if (isEnded || isClosedStatus) {
                        System.out.println("Found ended auction: " + auctionId);

                        // Xử lý kết thúc auction
                        bidService.processAuctionEnd(auctionId);

                        // Đánh dấu đã xử lý
                        processedAuctions.add(auctionId);

                        System.out.println("Processed auction end for: " + auctionId);
                    }

                } catch (Exception e) {
                    System.err.println("Error processing auction " + auctionId + ": " + e.getMessage());
                }
            }

        } catch (Exception e) {
            System.err.println("Error in auction end scheduler: " + e.getMessage());
        }
    }

    /**
     * Dọn dẹp processed auctions mỗi giờ để tránh memory leak
     */
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
