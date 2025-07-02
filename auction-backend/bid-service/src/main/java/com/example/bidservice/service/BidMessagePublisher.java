package com.example.bidservice.service;

import com.example.bidservice.config.RabbitMQConfig;
import com.example.bidservice.dto.AuctionEndMessage;
import com.example.bidservice.dto.BidCreatedMessage;
import com.example.bidservice.dto.BidNotification;
import com.example.bidservice.dto.BidResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.AmqpException;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class BidMessagePublisher {
    private static final Logger logger = LoggerFactory.getLogger(BidMessagePublisher.class);

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void publishBidCreated(Long auctionId, Long userId, BigDecimal bidAmount, Long bidId) {
        try {
            BidCreatedMessage message = new BidCreatedMessage(auctionId, userId, bidAmount, bidId);
            logger.info("📤 Publishing bid created: {}", message);
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.BID_EXCHANGE,
                    RabbitMQConfig.BID_CREATED_ROUTING_KEY,
                    message
            );
        } catch (AmqpException e) {
            logger.error("❌ Failed to publish bid created: {}", e.getMessage(), e);
        }
    }

    public void publishBidNotificationNewBid(Long auctionId, BidResponse bidResponse) {
        publishBidNotification(BidNotification.newBid(auctionId, bidResponse));
    }

    public void publishOutbidNotification(Long auctionId, Long outbidUserId, BigDecimal newBidAmount) {
        publishBidNotification(BidNotification.outbid(auctionId, newBidAmount, outbidUserId));
    }

    public void publishWinnerNotification(Long auctionId, BidResponse winningBid) {
        publishBidNotification(BidNotification.winner(auctionId, winningBid));
    }

    // 👉 Thêm method này để khớp với cách bạn gọi
    public void publishBidNotification(Long auctionId, BidResponse bidResponse, String notificationType) {
        BidNotification notification = new BidNotification(
                auctionId,
                notificationType,
                bidResponse,
                bidResponse != null ? bidResponse.getBidAmount() : null,
                "Notification: " + notificationType
        );
        publishBidNotification(notification);
    }

    private void publishBidNotification(BidNotification notification) {
        try {
            logger.info("📤 Publishing bid notification: {}", notification);
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.NOTIFICATION_EXCHANGE,
                    RabbitMQConfig.BID_NOTIFICATION_ROUTING_KEY,
                    notification
            );
        } catch (AmqpException e) {
            logger.error("❌ Failed to publish bid notification: {}", e.getMessage(), e);
        }
    }

    public void publishAuctionEnd(Long auctionId, String reason) {
        try {
            AuctionEndMessage message = new AuctionEndMessage(auctionId, reason);
            logger.info("📤 Publishing auction end: {}", message);
            rabbitTemplate.convertAndSend(
                    RabbitMQConfig.AUCTION_EXCHANGE,
                    RabbitMQConfig.AUCTION_END_ROUTING_KEY,
                    message
            );
        } catch (AmqpException e) {
            logger.error("❌ Failed to publish auction end: {}", e.getMessage(), e);
        }
    }
}
