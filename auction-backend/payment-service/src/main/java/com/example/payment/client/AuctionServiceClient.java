package com.example.payment.client;

import com.example.payment.dto.AuctionDto;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "auction-service")
public interface AuctionServiceClient {

    @GetMapping("/api/auctions/{id}")
    AuctionDto getAuctionById(@PathVariable("id") Long id);

    @PutMapping("/api/auctions/{id}/confirm-payment")
    void confirmPayment(
            @PathVariable("id") Long auctionId,
            @RequestParam("paymentId") String paymentId
    );
}
