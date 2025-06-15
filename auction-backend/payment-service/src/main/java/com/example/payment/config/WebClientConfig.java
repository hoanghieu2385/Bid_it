package com.example.payment.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

@Configuration
public class WebClientConfig {

    @Bean("auctionWebClient")
    public WebClient auctionWebClient() {
        return WebClient.builder()
                .baseUrl("http://auction-service:8083")
                .defaultHeader("Content-Type", "application/json")
                .build();
    }

    @Bean("userWebClient")
    public WebClient userWebClient() {
        return WebClient.builder()
                .baseUrl("http://user-service:8082")
                .defaultHeader("Content-Type", "application/json")
                .build();
    }
}