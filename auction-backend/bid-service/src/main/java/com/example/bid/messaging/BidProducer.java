package com.example.bid.messaging;

import com.example.bid.config.RabbitMQConfig;
import com.example.bid.dto.BidMessageDTO;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.stereotype.Service;

@Service
public class BidProducer {

    private final RabbitTemplate rabbitTemplate;

    public BidProducer(RabbitTemplate rabbitTemplate) {
        this.rabbitTemplate = rabbitTemplate;
    }

    public void sendBid(BidMessageDTO bidMessage) {
        rabbitTemplate.convertAndSend(RabbitMQConfig.BID_QUEUE, bidMessage);
    }
}
