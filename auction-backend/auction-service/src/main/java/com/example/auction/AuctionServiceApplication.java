package com.example.auction;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.retry.annotation.Retryable;
import org.springframework.scheduling.annotation.EnableScheduling;

import java.util.TimeZone;

@Retryable
@EnableDiscoveryClient
@EnableFeignClients(basePackages = "com.example.auction.client")
@EnableScheduling
@SpringBootApplication
public class AuctionServiceApplication {
    public static void main(String[] args) {
        // Set the default timezone to Asia/Ho_Chi_Minh
        TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));
        
        SpringApplication.run(AuctionServiceApplication.class, args);

    }
}
