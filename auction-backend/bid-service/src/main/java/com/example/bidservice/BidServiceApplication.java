package com.example.bidservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;
import org.springframework.cloud.openfeign.EnableFeignClients;
import org.springframework.retry.annotation.EnableRetry;

import java.util.TimeZone;

@EnableRetry
@EnableDiscoveryClient
@SpringBootApplication
@EnableFeignClients
public class BidServiceApplication {

	public static void main(String[] args) {
		// Set the default timezone to Asia/Ho_Chi_Minh
		TimeZone.setDefault(TimeZone.getTimeZone("Asia/Ho_Chi_Minh"));

		SpringApplication.run(BidServiceApplication.class, args);
	}

}
