package com.example.bidservice.service;

import com.example.bidservice.config.RabbitMQConfig;
import com.example.bidservice.dto.AuctionEndMessage;
import com.example.bidservice.dto.BidCreatedMessage;
import com.example.bidservice.dto.BidNotification;
import com.example.bidservice.entity.Bid;
import com.example.bidservice.repository.BidRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class BidMessageConsumer {
    private static final Logger logger = LoggerFactory.getLogger(BidMessageConsumer.class);

    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private IBidService bidService;

    @Autowired
    private IWebSocketService webSocketService;

    @RabbitListener(queues = RabbitMQConfig.BID_PROCESSING_QUEUE)
    @Transactional
    public void processBidCreated(BidCreatedMessage message) {
        logger.info("📥 Received bid created: {}", message);
        try {
            Long bidId = message.getBidId();
            Bid bid = bidRepository.findById(bidId).orElse(null);
            if (bid == null) {
                logger.error("❌ Bid not found: {}", bidId);
                return;
            }
            logger.info("🔄 Processing bid: {}", bidId);
            updateBidAnalytics(bid);
            updateBidCache(bid);
            logBidAuditTrail(bid);
            updateUserBidStatistics(bid.getUserId());
        } catch (Exception e) {
            logger.error("❌ Processing failed: {}", e.getMessage(), e);
            throw e;
        }
    }

    @RabbitListener(queues = RabbitMQConfig.BID_NOTIFICATION_QUEUE)
    public void processBidNotification(BidNotification message) {
        logger.info("📥 Received bid notification: {}", message);

        try {
            switch (message.getType()) {
                case "NEW_BID" -> {
                    webSocketService.sendNewBidNotification(message.getBidInfo());
                    webSocketService.sendBidHistoryUpdate(message.getAuctionId(), message.getBidInfo());
                }
                case "OUTBID" -> {
                    webSocketService.sendOutbidNotification(
                            message.getBidInfo().getUserId(),
                            message.getAuctionId(),
                            message.getCurrentHighestBid()
                    );
                }
                case "WINNER" -> webSocketService.sendAuctionEndNotification(message.getBidInfo());
                default -> logger.warn("⚠️ Unknown notification type: {}", message.getType());
            }
        } catch (Exception e) {
            logger.error("❌ Notification failed: {}", e.getMessage(), e);
            throw e;
        }
    }

    private void updateBidAnalytics(Bid bid) {
        logger.debug("📊 Analytics: {}", bid.getId());
    }

    private void updateBidCache(Bid bid) {
        logger.debug("🗄️ Cache: {}", bid.getId());
    }

    private void logBidAuditTrail(Bid bid) {
        logger.info("📝 AUDIT: {}", bid);
    }

    private void updateUserBidStatistics(Long userId) {
        logger.debug("👤 User stats: {}", userId);
    }
}
