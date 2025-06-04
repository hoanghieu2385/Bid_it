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

@Controller
public class WebSocketController {
    private static final Logger logger = LoggerFactory.getLogger(WebSocketController.class);

    @Autowired
    private IBidService bidService;

    @Autowired
    private IWebSocketService webSocketService;

    /**
     * Xử lý bid mới qua WebSocket - KHÔNG dùng @SendTo
     * BidService.createBid() sẽ tự động gửi WebSocket notification
     */
    @MessageMapping("/auction/{auctionId}/bid")
    public void handleNewBid(@DestinationVariable Long auctionId,
                             @Payload BidMessage bidMessage,
                             SimpMessageHeaderAccessor headerAccessor) {
        try {
            logger.info("Received bid via WebSocket: auction={}, user={}, amount={}",
                    auctionId, bidMessage.getUserId(), bidMessage.getBidAmount());

            // Tạo bid mới - BidService sẽ tự động gửi WebSocket notifications
            bidService.createBid(auctionId, bidMessage.getUserId(), bidMessage.getBidAmount());

        } catch (Exception e) {
            logger.error("Failed to create bid via WebSocket: {}", e.getMessage());

            // Gửi error message cho user cụ thể
            String userDestination = "/user/" + bidMessage.getUserId() + "/queue/errors";
            webSocketService.sendGeneralNotification(userDestination,
                    new ErrorResponse("Failed to create bid: " + e.getMessage()));
        }
    }

    /**
     * Join auction room - để track users và gửi initial data
     */
    @MessageMapping("/auction/{auctionId}/join")
    public void joinAuction(@DestinationVariable Long auctionId,
                            @Payload JoinMessage joinMessage) {
        try {
            logger.info("User {} joined auction {}", joinMessage.getUserId(), auctionId);

            // Gửi current statistics cho user mới join
            IBidService.BidStatistics stats = bidService.getBidStatistics(auctionId);
            String userDestination = "/user/" + joinMessage.getUserId() + "/queue/auction/" + auctionId + "/init";
            webSocketService.sendGeneralNotification(userDestination, stats);

            // Optional: Gửi thông báo user joined cho tất cả
            UserJoinedMessage userJoined = new UserJoinedMessage(
                    joinMessage.getUserId(),
                    joinMessage.getUsername(),
                    auctionId
            );
            webSocketService.sendGeneralNotification("/topic/auction/" + auctionId + "/activity", userJoined);

        } catch (Exception e) {
            logger.error("Failed to handle join auction: {}", e.getMessage());
        }
    }

    /**
     * Leave auction room
     */
    @MessageMapping("/auction/{auctionId}/leave")
    public void leaveAuction(@DestinationVariable Long auctionId,
                             @Payload LeaveMessage leaveMessage) {
        try {
            logger.info("User {} left auction {}", leaveMessage.getUserId(), auctionId);

            // Optional: Gửi thông báo user left
            UserLeftMessage userLeft = new UserLeftMessage(
                    leaveMessage.getUserId(),
                    leaveMessage.getUsername(),
                    auctionId
            );
            webSocketService.sendGeneralNotification("/topic/auction/" + auctionId + "/activity", userLeft);

        } catch (Exception e) {
            logger.error("Failed to handle leave auction: {}", e.getMessage());
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

    public static class JoinMessage {
        private Long userId;
        private String username;

        public JoinMessage() {}

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
    }

    public static class LeaveMessage {
        private Long userId;
        private String username;

        public LeaveMessage() {}

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
    }

    public static class UserJoinedMessage {
        private Long userId;
        private String username;
        private Long auctionId;
        private LocalDateTime timestamp;

        public UserJoinedMessage(Long userId, String username, Long auctionId) {
            this.userId = userId;
            this.username = username;
            this.auctionId = auctionId;
            this.timestamp = LocalDateTime.now();
        }

        // Getters
        public Long getUserId() { return userId; }
        public String getUsername() { return username; }
        public Long getAuctionId() { return auctionId; }
        public LocalDateTime getTimestamp() { return timestamp; }
    }

    public static class UserLeftMessage {
        private Long userId;
        private String username;
        private Long auctionId;
        private LocalDateTime timestamp;

        public UserLeftMessage(Long userId, String username, Long auctionId) {
            this.userId = userId;
            this.username = username;
            this.auctionId = auctionId;
            this.timestamp = LocalDateTime.now();
        }

        // Getters
        public Long getUserId() { return userId; }
        public String getUsername() { return username; }
        public Long getAuctionId() { return auctionId; }
        public LocalDateTime getTimestamp() { return timestamp; }
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