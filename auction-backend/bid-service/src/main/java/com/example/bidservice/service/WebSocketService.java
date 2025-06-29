package com.example.bidservice.service;

import com.example.bidservice.dto.BidNotification;
import com.example.bidservice.dto.BidResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class WebSocketService implements IWebSocketService {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketService.class);
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public void sendNewBidNotification(BidResponse bidResponse) {
        String destination = "/topic/auction/" + bidResponse.getAuctionId() + "/bids";
        BidNotification notification = BidNotification.newBid(bidResponse.getAuctionId(), bidResponse);

        logger.info("📤 SENDING NEW BID NOTIFICATION");
        logger.info("🎯 Destination: {}", destination);
        logger.info("🏛️ Auction ID: {}", bidResponse.getAuctionId());
        logger.info("👤 Bidder: {} {}", bidResponse.getFirstName(), bidResponse.getLastName());
        logger.info("💰 Bid Amount: {}", bidResponse.getBidAmount());
        logger.info("⏰ Bid Time: {}", bidResponse.getBidTime());

        try {
            messagingTemplate.convertAndSend(destination, notification);
            logger.info("✅ New bid notification sent successfully");
        } catch (Exception e) {
            logger.error("❌ Failed to send new bid notification: {}", e.getMessage());
            throw e;
        }
    }

    @Override
    public void sendBidFailed(Long userId, Long auctionId, String errorMessage) {
        String destination = "/user/" + userId + "/queue/auction/" + auctionId + "/errors";
        BidNotification notification = BidNotification.bidFailed(auctionId, errorMessage);

        logger.error("📤 SENDING BID FAILED NOTIFICATION");
        logger.error("🎯 Destination: {}", destination);
        logger.error("👤 User ID: {}", userId);
        logger.error("🏛️ Auction ID: {}", auctionId);
        logger.error("💥 Error: {}", errorMessage);

        try {
            messagingTemplate.convertAndSend(destination, notification);
            logger.info("✅ Bid failed notification sent successfully");
        } catch (Exception e) {
            logger.error("❌ Failed to send bid failed notification: {}", e.getMessage());
        }
    }

    @Override
    public void sendOutbidNotification(Long userId, Long auctionId, BigDecimal newHighestBid) {
        String destination = "/user/" + userId + "/queue/auction/" + auctionId + "/outbid";
        BidNotification notification = BidNotification.outbid(auctionId, newHighestBid);

        logger.info("📤 SENDING OUTBID NOTIFICATION");
        logger.info("🎯 Destination: {}", destination);
        logger.info("👤 Outbid User ID: {}", userId);
        logger.info("🏛️ Auction ID: {}", auctionId);
        logger.info("💰 New Highest Bid: {}", newHighestBid);

        try {
            messagingTemplate.convertAndSend(destination, notification);
            logger.info("✅ Outbid notification sent successfully");
        } catch (Exception e) {
            logger.error("❌ Failed to send outbid notification: {}", e.getMessage());
        }
    }

    @Override
    public void sendAuctionEndNotification(BidResponse winningBid) {
        String destination = "/topic/auction/" + winningBid.getAuctionId() + "/winner";
        BidNotification notification = BidNotification.auctionEnd(winningBid.getAuctionId(), winningBid);

        logger.info("📤 SENDING AUCTION END NOTIFICATION");
        logger.info("🎯 Destination: {}", destination);
        logger.info("🏛️ Auction ID: {}", winningBid.getAuctionId());
        logger.info("🏆 Winner: {} {}", winningBid.getFirstName(), winningBid.getLastName());
        logger.info("💰 Winning Amount: {}", winningBid.getBidAmount());

        try {
            messagingTemplate.convertAndSend(destination, notification);
            logger.info("✅ Auction end notification sent successfully");
        } catch (Exception e) {
            logger.error("❌ Failed to send auction end notification: {}", e.getMessage());
        }
    }

    @Override
    public void sendBidStatistics(Long auctionId, IBidService.BidStatistics stats) {
        String destination = "/topic/auction/" + auctionId + "/stats";

        logger.info("📤 SENDING BID STATISTICS");
        logger.info("🎯 Destination: {}", destination);
        logger.info("🏛️ Auction ID: {}", auctionId);
        logger.info("📊 Total Bids: {}", stats.getTotalBids());
        logger.info("💰 Highest Bid: {}", stats.getHighestBid());
        logger.info("👤 Highest Bidder: {}", stats.getHighestBidder());

        try {
            messagingTemplate.convertAndSend(destination, stats);
            logger.info("✅ Bid statistics sent successfully");
        } catch (Exception e) {
            logger.error("❌ Failed to send bid statistics: {}", e.getMessage());
        }
    }

    @Override
    public void sendBidHistoryUpdate(Long auctionId, BidResponse bid) {
        String destination = "/topic/auction/" + auctionId + "/history";

        logger.info("📤 SENDING BID HISTORY UPDATE");
        logger.info("🎯 Destination: {}", destination);
        logger.info("🏛️ Auction ID: {}", auctionId);
        logger.info("🆔 Bid ID: {}", bid.getId());
        logger.info("💰 Amount: {}", bid.getBidAmount());

        try {
            messagingTemplate.convertAndSend(destination, bid);
            logger.info("✅ Bid history update sent successfully");
        } catch (Exception e) {
            logger.error("❌ Failed to send bid history update: {}", e.getMessage());
        }
    }

    @Override
    public void sendGeneralNotification(String topic, Object payload) {
        logger.info("📤 SENDING GENERAL NOTIFICATION");
        logger.info("🎯 Topic: {}", topic);
        logger.info("📦 Payload type: {}", payload.getClass().getSimpleName());

        try {
            messagingTemplate.convertAndSend(topic, payload);
            logger.info("✅ General notification sent successfully");
        } catch (Exception e) {
            logger.error("❌ Failed to send general notification: {}", e.getMessage());
        }
    }
}