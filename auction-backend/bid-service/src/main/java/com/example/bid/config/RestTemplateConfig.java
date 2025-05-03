package com.example.bid.config;

import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.client.RestTemplate;

@Configuration
public class RestTemplateConfig {

    @Bean
    @LoadBalanced // ⬅️ Key annotation to resolve service names via Eureka
    public RestTemplate restTemplate() {
        return new RestTemplate();
    }
}
