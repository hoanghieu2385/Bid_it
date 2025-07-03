package com.example.auction.publisher;

import com.example.auction.dto.AuctionEndMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

@Service
public class BidMessagePublisher {

    private static final Logger logger = LoggerFactory.getLogger(BidMessagePublisher.class);

    @Autowired
    private RabbitTemplate rabbitTemplate;

    public void publishAuctionEnd(Long auctionId, String reason) {
        AuctionEndMessage message = new AuctionEndMessage(auctionId, reason);
        rabbitTemplate.convertAndSend(
                "auction.exchange",
                "auction.end",
                message
        );
        logger.info("📤 Published AuctionEndMessage: {}", message);
    }
}
