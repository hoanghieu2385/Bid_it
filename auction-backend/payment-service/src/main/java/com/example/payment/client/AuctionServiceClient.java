package com.example.payment.client;

import com.example.payment.dto.AuctionDto;
import com.example.payment.enums.AuctionStatus;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

@FeignClient(name = "auction-service")
public interface AuctionServiceClient {

    @GetMapping("/api/auctions/{id}")
    AuctionDto getAuctionById(@PathVariable("id") Long id);

    @PutMapping("/api/auctions/{id}/confirm-payment")
    void confirmPayment(
            @PathVariable("id") Long auctionId,
            @RequestParam("paymentId") String paymentId
    );

    // Thêm method để update auction status: CLOSED -> SOLD nếu thanh toán thành công
    @PutMapping("/api/auctions/{id}/status")
    void updateAuctionStatus(
            @PathVariable("id") Long auctionId,
            @RequestBody AuctionStatus status
    );
}