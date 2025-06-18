package com.example.bidservice.controller;

import com.example.bidservice.context.TokenContextHolder;
import com.example.bidservice.dto.BidRequest;
import com.example.bidservice.entity.Bid;
import com.example.bidservice.service.IBidService;
import com.example.bidservice.service.IWebSocketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.math.BigDecimal;

@Controller
public class WebSocketController {

    @Autowired
    private IBidService bidService;

    @Autowired
    private IWebSocketService webSocketService;

    @MessageMapping("/auction/{auctionId}/bid")
    public void handleNewBid(
            @DestinationVariable Long auctionId,
            @Payload BidRequest bidRequest,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        try {
            // Đảm bảo token được set từ session
            String authToken = (String) headerAccessor.getSessionAttributes().get("authToken");
            if (authToken != null) {
                TokenContextHolder.setToken(authToken);
//                System.out.println("Token set in handleNewBid: " + authToken);
            } else {
                System.out.println("No auth token found in session");
            }

            System.out.println("Received bid via WebSocket: auction=" + auctionId +
                    ", user=" + bidRequest.getUserId() +
                    ", amount=" + bidRequest.getBidAmount());

            // Tạo bid
            Bid newBid = bidService.createBid(auctionId, bidRequest.getUserId(), bidRequest.getBidAmount());

//            System.out.println("Bid created successfully: " + newBid.getId());

        } catch (Exception e) {
            System.err.println("Failed to create bid via WebSocket: " + e.getMessage());
            e.printStackTrace();

            // Gửi error message về client
            try {
                webSocketService.sendBidFailed(bidRequest.getUserId(), auctionId, e.getMessage());
            } catch (Exception notifyError) {
                System.err.println("Failed to send error notification: " + notifyError.getMessage());
            }
        } finally {
            // Đảm bảo clear ThreadLocal
            TokenContextHolder.clear();
        }
    }

    @MessageMapping("/auction/{auctionId}/join")
    public void handleJoinAuction(
            @DestinationVariable Long auctionId,
            @Payload Object joinData,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        try {
            // Set token từ session
            String authToken = (String) headerAccessor.getSessionAttributes().get("authToken");
            if (authToken != null) {
                TokenContextHolder.setToken(authToken);
            }

            System.out.println("User joined auction " + auctionId + ": " + joinData);

            // Có thể thêm logic gửi thông tin phiên đấu giá hiện tại cho user mới join

        } catch (Exception e) {
            System.err.println("Failed to handle join auction: " + e.getMessage());
        } finally {
            TokenContextHolder.clear();
        }
    }
}