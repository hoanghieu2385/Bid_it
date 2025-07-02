package com.example.bidservice.config;

import org.springframework.amqp.core.*;
import org.springframework.amqp.rabbit.annotation.EnableRabbit;
import org.springframework.amqp.rabbit.connection.ConnectionFactory;
import org.springframework.amqp.rabbit.core.RabbitTemplate;
import org.springframework.amqp.support.converter.Jackson2JsonMessageConverter;
import org.springframework.amqp.support.converter.MessageConverter;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * RabbitMQ Configuration cho Bid Service
 *
 * Queues:
 * - bid.processing.queue: Xử lý bid mới
 * - bid.notification.queue: Gửi thông báo realtime
 * - auction.winner.queue: Xử lý winner khi auction kết thúc
 * - bid.dlq: Dead letter queue cho failed messages
 */
@Configuration
@EnableRabbit
public class RabbitMQConfig {

    // ===== EXCHANGES =====
    public static final String BID_EXCHANGE = "bid.exchange";
    public static final String NOTIFICATION_EXCHANGE = "notification.exchange";
    public static final String AUCTION_EXCHANGE = "auction.exchange";
    public static final String DLX_EXCHANGE = "dlx.exchange";

    // ===== QUEUES =====
    public static final String BID_PROCESSING_QUEUE = "bid.processing.queue";
    public static final String BID_NOTIFICATION_QUEUE = "bid.notification.queue";
    public static final String AUCTION_WINNER_QUEUE = "auction.winner.queue";
    public static final String BID_DLQ = "bid.dlq";

    // ===== ROUTING KEYS =====
    public static final String BID_CREATED_ROUTING_KEY = "bid.created";
    public static final String BID_NOTIFICATION_ROUTING_KEY = "bid.notification";
    public static final String AUCTION_END_ROUTING_KEY = "auction.end";
    public static final String BID_FAILED_ROUTING_KEY = "bid.failed";

    // ===== MESSAGE CONVERTER =====
    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter();
    }

    @Bean
    public RabbitTemplate rabbitTemplate(ConnectionFactory connectionFactory) {
        RabbitTemplate template = new RabbitTemplate(connectionFactory);
        template.setMessageConverter(jsonMessageConverter());
        return template;
    }

    // ===== EXCHANGES =====
    @Bean
    public TopicExchange bidExchange() {
        return new TopicExchange(BID_EXCHANGE);
    }

    @Bean
    public TopicExchange notificationExchange() {
        return new TopicExchange(NOTIFICATION_EXCHANGE);
    }

    @Bean
    public TopicExchange auctionExchange() {
        return new TopicExchange(AUCTION_EXCHANGE);
    }

    @Bean
    public DirectExchange dlxExchange() {
        return new DirectExchange(DLX_EXCHANGE);
    }

    // ===== QUEUES =====
    @Bean
    public Queue bidProcessingQueue() {
        return QueueBuilder.durable(BID_PROCESSING_QUEUE)
                .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", BID_FAILED_ROUTING_KEY)
                .withArgument("x-message-ttl", 300000) // 5 minutes TTL
                .build();
    }

    @Bean
    public Queue bidNotificationQueue() {
        return QueueBuilder.durable(BID_NOTIFICATION_QUEUE)
                .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", BID_FAILED_ROUTING_KEY)
                .withArgument("x-message-ttl", 60000) // 1 minute TTL for notifications
                .build();
    }

    @Bean
    public Queue auctionWinnerQueue() {
        return QueueBuilder.durable(AUCTION_WINNER_QUEUE)
                .withArgument("x-dead-letter-exchange", DLX_EXCHANGE)
                .withArgument("x-dead-letter-routing-key", BID_FAILED_ROUTING_KEY)
                .withArgument("x-message-ttl", 300000) // 5 minutes TTL
                .build();
    }

    @Bean
    public Queue bidDeadLetterQueue() {
        return QueueBuilder.durable(BID_DLQ).build();
    }

    // ===== BINDINGS =====
    @Bean
    public Binding bidProcessingBinding() {
        return BindingBuilder
                .bind(bidProcessingQueue())
                .to(bidExchange())
                .with(BID_CREATED_ROUTING_KEY);
    }

    @Bean
    public Binding bidNotificationBinding() {
        return BindingBuilder
                .bind(bidNotificationQueue())
                .to(notificationExchange())
                .with(BID_NOTIFICATION_ROUTING_KEY);
    }

    @Bean
    public Binding auctionWinnerBinding() {
        return BindingBuilder
                .bind(auctionWinnerQueue())
                .to(auctionExchange())
                .with(AUCTION_END_ROUTING_KEY);
    }

    @Bean
    public Binding bidDlqBinding() {
        return BindingBuilder
                .bind(bidDeadLetterQueue())
                .to(dlxExchange())
                .with(BID_FAILED_ROUTING_KEY);
    }
}