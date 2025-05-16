package com.example.bid.messaging;

import com.example.bid.dto.BidMessageDTO;
import com.example.bid.model.Bid;
import com.example.bid.service.BidService;
import com.example.bid.config.RabbitMQConfig;
import org.springframework.amqp.rabbit.annotation.RabbitListener;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class BidConsumer {

    private final BidService bidService;

    public BidConsumer(BidService bidService) {
        this.bidService = bidService;
    }

    @RabbitListener(queues = RabbitMQConfig.BID_QUEUE)
    public void receive(BidMessageDTO message) {
        try {
            Bid bid = new Bid();
            bid.setAuctionId(message.getAuctionId());
            bid.setBidderId(message.getBidderId());
            bid.setAmount(message.getAmount());
            bid.setCreatedAt(LocalDateTime.now());

            bidService.placeBid(bid);

        } catch (IllegalArgumentException e) {
            System.err.println("⚠️ Bid rejected: " + e.getMessage());
        } catch (Exception e) {
            System.err.println("❌ Unexpected error while processing bid: " + e.getMessage());
            e.printStackTrace();
        }
    }
}