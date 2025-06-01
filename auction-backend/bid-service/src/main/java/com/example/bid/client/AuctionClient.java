package com.example.bid.client;

import com.example.bid.dto.AuctionDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import com.example.bid.config.FeignClientInterceptorConfig;

@FeignClient(name = "auction-service", configuration = FeignClientInterceptorConfig.class)
public interface AuctionClient {

    @GetMapping("/api/auctions/{id}")
    AuctionDTO getAuctionById(@PathVariable("id") Long id);
}
