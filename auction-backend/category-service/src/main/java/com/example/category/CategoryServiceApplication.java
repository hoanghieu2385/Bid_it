package com.example.category;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@EnableDiscoveryClient
@SpringBootApplication
@EntityScan("com.example.category.model")
public class CategoryServiceApplication {
    
    public static void main(String[] args) {
        SpringApplication.run(CategoryServiceApplication.class, args);
    }
}