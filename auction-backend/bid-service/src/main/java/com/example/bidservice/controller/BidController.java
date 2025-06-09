package com.example.bidservice.controller;

import com.example.bidservice.entity.Bid;
import com.example.bidservice.repository.BidRepository;
import com.example.bidservice.service.IBidService;
import jakarta.validation.Valid;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/bids")
public class BidController {
    @Autowired
    private BidRepository bidRepository;

    @Autowired
    private IBidService bidService;

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
     * Lấy bid history của auction
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
     * Endpoint để auction-service gọi lấy thông tin winner
     */
    @GetMapping("/auction/{auctionId}/winner")
    public ResponseEntity<WinnerResponse> getWinnerByAuctionId(@PathVariable Long auctionId) {
        try {
            Optional<Bid> highestBid = bidRepository.findHighestBidByAuctionId(auctionId);

            if (highestBid.isPresent()) {
                Bid winningBid = highestBid.get();
                WinnerResponse response = new WinnerResponse(
                        winningBid.getUserId(),
                        winningBid.getBidAmount().toString(),
                        winningBid.getBidTime().toString()
                );
                return ResponseEntity.ok(response);
            } else {
                // Không có bid nào
                return ResponseEntity.ok(new WinnerResponse(null, null, null));
            }
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
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

        // Getters and setters
        public Long getAuctionId() { return auctionId; }
        public void setAuctionId(Long auctionId) { this.auctionId = auctionId; }

        public Long getUserId() { return userId; }
        public void setUserId(Long userId) { this.userId = userId; }

        public BigDecimal getBidAmount() { return bidAmount; }
        public void setBidAmount(BigDecimal bidAmount) { this.bidAmount = bidAmount; }
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

    /**
     * DTO Response cho winner info
     */
    public static class WinnerResponse {
        private Long userId;
        private String bidAmount;
        private String bidTime;

        public WinnerResponse() {}

        public WinnerResponse(Long userId, String bidAmount, String bidTime) {
            this.userId = userId;
            this.bidAmount = bidAmount;
            this.bidTime = bidTime;
        }

        // Getters and Setters
        public Long getUserId() {
            return userId;
        }

        public void setUserId(Long userId) {
            this.userId = userId;
        }

        public String getBidAmount() {
            return bidAmount;
        }

        public void setBidAmount(String bidAmount) {
            this.bidAmount = bidAmount;
        }

        public String getBidTime() {
            return bidTime;
        }

        public void setBidTime(String bidTime) {
            this.bidTime = bidTime;
        }
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