package com.example.bidservice.controller;

import com.example.bidservice.service.IBidService;
import com.example.bidservice.service.IWebSocketService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.math.BigDecimal;
import java.time.LocalDateTime;

/**
 * Controller xử lý bid qua WebSocket:
 * - Nhận bid mới: /app/auction/{auctionId}/bid
 * - Gửi kết quả:
 *      + Thành công → /topic/auction/{auctionId}/bids
 *      + Lỗi → /user/{userId}/queue/auction/{auctionId}/errors
 */

@Controller
public class WebSocketController {
    private static final Logger logger = LoggerFactory.getLogger(WebSocketController.class);

    @Autowired
    private IBidService bidService;

    @Autowired
    private IWebSocketService webSocketService;

    @MessageMapping("/auction/{auctionId}/bid")
    public void handleNewBid(@DestinationVariable Long auctionId,
                             @Payload BidMessage bidMessage,
                             SimpMessageHeaderAccessor headerAccessor) {
        try {
            logger.info("Received bid via WebSocket: auction={}, user={}, amount={}",
                    auctionId, bidMessage.getUserId(), bidMessage.getBidAmount());

            bidService.createBid(auctionId, bidMessage.getUserId(), bidMessage.getBidAmount());

        } catch (Exception e) {
            logger.error("Failed to create bid via WebSocket: {}", e.getMessage());

            // Gửi BID_FAILED qua WebSocket
            webSocketService.sendBidFailed(
                    bidMessage.getUserId(),
                    auctionId,
                    e.getMessage()
            );
        }
    }

    // Message Classes
    public static class BidMessage {
        private Long userId;
        private BigDecimal bidAmount;
        private LocalDateTime timestamp;

        public BidMessage() {
            this.timestamp = LocalDateTime.now();
        }

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public BigDecimal getBidAmount() { return bidAmount; }
        public void setBidAmount(BigDecimal bidAmount) { this.bidAmount = bidAmount; }

        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    }

    public static class ErrorResponse {
        private String message;
        private LocalDateTime timestamp;

        public ErrorResponse(String message) {
            this.message = message;
            this.timestamp = LocalDateTime.now();
        }

        public String getMessage() { return message; }
        public LocalDateTime getTimestamp() { return timestamp; }
    }
}