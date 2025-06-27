package com.example.auction.client;

import com.example.auction.dto.AuctionWinEmailRequest;
import org.springframework.stereotype.Component;

@Component
public class EmailClientFallback implements EmailClient {
    @Override
    public void sendAuctionWinnerEmail(AuctionWinEmailRequest request) {
        System.err.println("❌ Fallback: Không thể gửi email cho " + request.getEmail());
    }
}
