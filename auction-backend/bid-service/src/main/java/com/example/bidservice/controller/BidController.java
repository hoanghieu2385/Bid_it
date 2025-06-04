package com.example.bidservice.controller;

import com.example.bidservice.entity.Bid;
import com.example.bidservice.service.IBidService;
import com.example.bidservice.service.IWebSocketService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/bids")
public class BidController {

    @Autowired
    private IBidService bidService;

    @Autowired
    private IWebSocketService webSocketService;

    /**
     * Tạo bid mới qua REST API
     */
    @PostMapping
    public ResponseEntity<ApiResponse<Bid>> createBid(@Valid @RequestBody CreateBidRequest request) {
        try {
            Bid bid = bidService.createBid(request.getAuctionId(), request.getUserId(), request.getBidAmount());
            return ResponseEntity.ok(new ApiResponse<>("Bid created successfully", bid));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("Failed to create bid: " + e.getMessage(), null));
        }
    }

    /**
     * Lấy danh sách bid của auction
     */
    @GetMapping("/auction/{auctionId}")
    public ResponseEntity<ApiResponse<List<Bid>>> getBidsByAuction(@PathVariable Long auctionId) {
        try {
            List<Bid> bids = bidService.getBidsByAuction(auctionId);
            return ResponseEntity.ok(new ApiResponse<>("Success", bids));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("Failed to get bids: " + e.getMessage(), null));
        }
    }

    /**
     * Lấy bid history của auction (10 bid gần nhất)
     */
    @GetMapping("/auction/{auctionId}/history")
    public ResponseEntity<ApiResponse<List<Bid>>> getBidHistory(@PathVariable Long auctionId) {
        try {
            List<Bid> history = bidService.getBidHistory(auctionId);
            return ResponseEntity.ok(new ApiResponse<>("Success", history));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("Failed to get bid history: " + e.getMessage(), null));
        }
    }

    /**
     * Lấy bid cao nhất hiện tại của auction
     */
    @GetMapping("/auction/{auctionId}/highest")
    public ResponseEntity<ApiResponse<HighestBidResponse>> getHighestBid(@PathVariable Long auctionId) {
        try {
            BigDecimal highestBid = bidService.getCurrentHighestBid(auctionId);
            HighestBidResponse response = new HighestBidResponse(auctionId, highestBid);
            return ResponseEntity.ok(new ApiResponse<>("Success", response));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("Failed to get highest bid: " + e.getMessage(), null));
        }
    }

    /**
     * Lấy thống kê bid của auction
     */
    @GetMapping("/auction/{auctionId}/statistics")
    public ResponseEntity<ApiResponse<IBidService.BidStatistics>> getBidStatistics(@PathVariable Long auctionId) {
        try {
            IBidService.BidStatistics stats = bidService.getBidStatistics(auctionId);
            return ResponseEntity.ok(new ApiResponse<>("Success", stats));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("Failed to get statistics: " + e.getMessage(), null));
        }
    }

    /**
     * Lấy bid của user
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<Bid>>> getBidsByUser(@PathVariable Long userId) {
        try {
            List<Bid> bids = bidService.getBidsByUser(userId);
            return ResponseEntity.ok(new ApiResponse<>("Success", bids));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("Failed to get user bids: " + e.getMessage(), null));
        }
    }

    /**
     * Validate bid trước khi tạo (để frontend kiểm tra)
     */
    @PostMapping("/validate")
    public ResponseEntity<ApiResponse<String>> validateBid(@Valid @RequestBody CreateBidRequest request) {
        try {
            bidService.validateBid(request.getAuctionId(), request.getUserId(), request.getBidAmount());
            return ResponseEntity.ok(new ApiResponse<>("Bid is valid", "OK"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("Validation failed: " + e.getMessage(), null));
        }
    }

    /**
     * THÊM: Test WebSocket manually - để debug
     */
    @PostMapping("/test/websocket/{auctionId}")
    public ResponseEntity<ApiResponse<String>> testWebSocket(@PathVariable Long auctionId) {
        try {
            // Test gửi statistics
            IBidService.BidStatistics stats = bidService.getBidStatistics(auctionId);
            webSocketService.sendBidStatistics(auctionId, stats);

            // Test gửi notification
            webSocketService.sendGeneralNotification("/topic/auction/" + auctionId + "/test",
                    "Test message at " + LocalDateTime.now());

            return ResponseEntity.ok(new ApiResponse<>("WebSocket test sent successfully", "OK"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("WebSocket test failed: " + e.getMessage(), null));
        }
    }

    /**
     * THÊM: Trigger manual bid notification - để testing
     */
    @PostMapping("/trigger/notification")
    public ResponseEntity<ApiResponse<String>> triggerNotification(@RequestBody TriggerNotificationRequest request) {
        try {
            // Tạo mock bid response để test
            MockBidResponse mockBid = new MockBidResponse(
                    request.getAuctionId(),
                    request.getUserId(),
                    request.getBidAmount()
            );

            webSocketService.sendGeneralNotification("/topic/auction/" + request.getAuctionId() + "/bids", mockBid);

            return ResponseEntity.ok(new ApiResponse<>("Notification triggered successfully", "OK"));
        } catch (Exception e) {
            return ResponseEntity.badRequest()
                    .body(new ApiResponse<>("Failed to trigger notification: " + e.getMessage(), null));
        }
    }

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<ApiResponse<String>> healthCheck() {
        return ResponseEntity.ok(new ApiResponse<>("Bid service is running", "OK"));
    }

    // DTO Classes
    public static class CreateBidRequest {
        @NotNull(message = "Auction ID is required")
        private Long auctionId;

        @NotNull(message = "User ID is required")
        private Long userId;

        @NotNull(message = "Bid amount is required")
        @DecimalMin(value = "0.01", message = "Bid amount must be greater than 0")
        private BigDecimal bidAmount;

        public CreateBidRequest() {}

        public CreateBidRequest(Long auctionId, Long userId, BigDecimal bidAmount) {
            this.auctionId = auctionId;
            this.userId = userId;
            this.bidAmount = bidAmount;
        }

        // Getters and setters
        public Long getAuctionId() { return auctionId; }
        public void setAuctionId(Long auctionId) { this.auctionId = auctionId; }

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public BigDecimal getBidAmount() { return bidAmount; }
        public void setBidAmount(BigDecimal bidAmount) { this.bidAmount = bidAmount; }
    }

    public static class TriggerNotificationRequest {
        private Long auctionId;
        private Long userId;
        private BigDecimal bidAmount;

        public TriggerNotificationRequest() {}

        // Getters and setters
        public Long getAuctionId() { return auctionId; }
        public void setAuctionId(Long auctionId) { this.auctionId = auctionId; }

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public BigDecimal getBidAmount() { return bidAmount; }
        public void setBidAmount(BigDecimal bidAmount) { this.bidAmount = bidAmount; }
    }

    public static class MockBidResponse {
        private Long auctionId;
        private Long userId;
        private BigDecimal bidAmount;
        private LocalDateTime timestamp;

        public MockBidResponse(Long auctionId, Long userId, BigDecimal bidAmount) {
            this.auctionId = auctionId;
            this.userId = userId;
            this.bidAmount = bidAmount;
            this.timestamp = LocalDateTime.now();
        }

        // Getters
        public Long getAuctionId() { return auctionId; }
        public Long getUserId() { return userId; }
        public BigDecimal getBidAmount() { return bidAmount; }
        public LocalDateTime getTimestamp() { return timestamp; }
    }

    public static class HighestBidResponse {
        private Long auctionId;
        private BigDecimal highestBid;
        private LocalDateTime timestamp;

        public HighestBidResponse() {
            this.timestamp = LocalDateTime.now();
        }

        public HighestBidResponse(Long auctionId, BigDecimal highestBid) {
            this();
            this.auctionId = auctionId;
            this.highestBid = highestBid;
        }

        // Getters and setters
        public Long getAuctionId() { return auctionId; }
        public void setAuctionId(Long auctionId) { this.auctionId = auctionId; }

        public BigDecimal getHighestBid() { return highestBid; }
        public void setHighestBid(BigDecimal highestBid) { this.highestBid = highestBid; }

        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }
    }

    public static class ApiResponse<T> {
        private String message;
        private T data;
        private LocalDateTime timestamp;
        private boolean success;

        public ApiResponse() {
            this.timestamp = LocalDateTime.now();
        }

        public ApiResponse(String message, T data) {
            this();
            this.message = message;
            this.data = data;
            this.success = data != null || "Success".equals(message) || message.contains("successfully");
        }

        // Getters and setters
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }

        public T getData() { return data; }
        public void setData(T data) { this.data = data; }

        public LocalDateTime getTimestamp() { return timestamp; }
        public void setTimestamp(LocalDateTime timestamp) { this.timestamp = timestamp; }

        public boolean isSuccess() { return success; }
        public void setSuccess(boolean success) { this.success = success; }
    }
}