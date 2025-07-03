package com.example.auction.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class RabbitMQConfig {

    // Auction exchange & queue config (phải khớp với bid-service)
    public static final String AUCTION_EXCHANGE = "auction.exchange";
    public static final String AUCTION_END_QUEUE = "auction.end";
    public static final String AUCTION_END_ROUTING_KEY = "auction.end";

    @Bean
    public TopicExchange auctionExchange() {
        return new TopicExchange(AUCTION_EXCHANGE);
    }

    @Bean
    public Queue auctionEndQueue() {
        return new Queue(AUCTION_END_QUEUE);
    }

    @Bean
    public Binding auctionEndBinding() {
        return BindingBuilder.bind(auctionEndQueue()).to(auctionExchange()).with(AUCTION_END_ROUTING_KEY);
    }

    // JSON converter để RabbitListener tự convert DTO
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    // RabbitTemplate KHÔNG bắt buộc trong auction-service, nhưng vẫn OK để debug nếu sau này cần publish lại
    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }
}
