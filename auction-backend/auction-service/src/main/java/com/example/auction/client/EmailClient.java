package com.example.auction.client;

import com.example.auction.dto.AuctionWinEmailRequest;
import com.example.auction.config.FeignClientConfig;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.stereotype.Component;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

@FeignClient(
        name = "user-service",
        configuration = FeignClientConfig.class,
        fallback = EmailClientFallback.class
)
public interface EmailClient {

    @PostMapping("/api/internal/email/auction-winner")
    void sendAuctionWinnerEmail(@RequestBody AuctionWinEmailRequest request);
}
