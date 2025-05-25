package com.example.auction;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableDiscoveryClient
@EnableFeignClients(basePackages = "com.example.auction.client")
@SpringBootApplication
public class AuctionServiceApplication {
    public static void main(String[] args) {

        SpringApplication.run(AuctionServiceApplication.class, args);

    }
}
