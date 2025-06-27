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
        // fallback = EmailClientFallback.class // Optional: để handle khi service down
)
public interface EmailClient {

    @PostMapping("/api/internal/email/auction-winner")
    void sendAuctionWinnerEmail(@RequestBody AuctionWinEmailRequest request);
}

// // Optional: Fallback class
// @Component
// class EmailClientFallback implements EmailClient {

//     @Override
//     public void sendAuctionWinnerEmail(AuctionWinEmailRequest request) {
//         System.err.println("❌ EmailClient fallback: Không thể gửi email cho " + request.getEmail());
//         // Log hoặc lưu vào queue để retry sau
//     }
// }