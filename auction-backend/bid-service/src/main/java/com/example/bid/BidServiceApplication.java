package com.example.bid;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;

@EnableDiscoveryClient
@EnableFeignClients(basePackages = "com.example.bid.client")
@SpringBootApplication
public class BidServiceApplication {

    public static void main(String[] args) {
        SpringApplication.run(BidServiceApplication.class, args);
    }

}
