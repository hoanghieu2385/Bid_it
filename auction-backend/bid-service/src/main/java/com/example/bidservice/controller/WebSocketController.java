// ============= WebSocketController.java =============
package com.example.bidservice.controller;

import com.example.bidservice.context.TokenContextHolder;
import com.example.bidservice.dto.BidRequest;
import com.example.bidservice.entity.Bid;
import com.example.bidservice.service.IBidService;
import com.example.bidservice.service.IWebSocketService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.Payload;
import org.springframework.messaging.simp.SimpMessageHeaderAccessor;
import org.springframework.stereotype.Controller;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Controller
public class WebSocketController {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketController.class);
    private static final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss.SSS");

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
        String sessionId = headerAccessor.getSessionId();
        String timestamp = LocalDateTime.now().format(formatter);

        logger.info("🎯 ===== NEW BID REQUEST START =====");
        logger.info("⏰ Timestamp: {}", timestamp);
        logger.info("🔗 Session ID: {}", sessionId);
        logger.info("🏛️ Auction ID: {}", auctionId);
        logger.info("👤 User ID: {}", bidRequest.getUserId());
        logger.info("💰 Bid Amount: {}", bidRequest.getBidAmount());

        try {
            // Token setup
            String authToken = (String) headerAccessor.getSessionAttributes().get("authToken");
            if (authToken != null) {
                TokenContextHolder.setToken(authToken);
                logger.debug("🔐 Auth token set for session: {}", sessionId);
            } else {
                logger.warn("⚠️ No auth token found in session: {}", sessionId);
            }

            logger.info("🔄 Starting bid processing...");
            long startTime = System.currentTimeMillis();

            // Create bid - sẽ gọi validate và tất cả logic
            Bid newBid = bidService.createBid(auctionId, bidRequest.getUserId(), bidRequest.getBidAmount());

            long processingTime = System.currentTimeMillis() - startTime;

            logger.info("✅ ===== BID CREATED SUCCESSFULLY =====");
            logger.info("🆔 New Bid ID: {}", newBid.getId());
            logger.info("⚡ Processing time: {}ms", processingTime);
            logger.info("📊 Final bid status: {}", newBid.getStatus());
            logger.info("🏆 Is winning: {}", newBid.getIsWinning());
            logger.info("⏰ Bid time: {}", newBid.getBidTime());
            logger.info("🎯 ===== BID REQUEST END =====");

        } catch (Exception e) {
            long processingTime = System.currentTimeMillis() - System.currentTimeMillis();

            logger.error("❌ ===== BID FAILED =====");
            logger.error("🔗 Session ID: {}", sessionId);
            logger.error("🏛️ Auction ID: {}", auctionId);
            logger.error("👤 User ID: {}", bidRequest.getUserId());
            logger.error("💰 Attempted Bid Amount: {}", bidRequest.getBidAmount());
            logger.error("💥 Error Type: {}", e.getClass().getSimpleName());
            logger.error("📝 Error Message: {}", e.getMessage());
            logger.error("⚡ Processing time before error: {}ms", processingTime);

            // Categorize error for better logging
            if (e.getMessage().contains("already have the highest bid")) {
                logger.error("🔄 DUPLICATE BID: User {} already has highest bid on auction {}",
                        bidRequest.getUserId(), auctionId);
            } else if (e.getMessage().contains("need at least 50 points")) {
                logger.error("🎯 INSUFFICIENT POINTS: User {} has less than 50 points",
                        bidRequest.getUserId());
            } else if (e.getMessage().contains("must be higher than current highest bid")) {
                logger.error("📉 BID TOO LOW: Bid {} is not higher than current highest",
                        bidRequest.getBidAmount());
            } else if (e.getMessage().contains("Auction has ended")) {
                logger.error("⏰ AUCTION ENDED: Auction {} is no longer active", auctionId);
            } else if (e.getMessage().contains("cannot bid on your own auction")) {
                logger.error("🚫 SELF BID: User {} tried to bid on own auction {}",
                        bidRequest.getUserId(), auctionId);
            }

            // Send error notification
            try {
                webSocketService.sendBidFailed(bidRequest.getUserId(), auctionId, e.getMessage());
                logger.info("📤 Error notification sent to user: {}", bidRequest.getUserId());
            } catch (Exception notifyError) {
                logger.error("💥 Failed to send error notification: {}", notifyError.getMessage());
            }

            logger.error("🎯 ===== BID REQUEST END (FAILED) =====");

        } finally {
            TokenContextHolder.clear();
        }
    }

    @MessageMapping("/auction/{auctionId}/join")
    public void handleJoinAuction(
            @DestinationVariable Long auctionId,
            @Payload Object joinData,
            SimpMessageHeaderAccessor headerAccessor
    ) {
        String sessionId = headerAccessor.getSessionId();
        logger.info("🚪 User joined auction {} - Session: {}", auctionId, sessionId);

        try {
            String authToken = (String) headerAccessor.getSessionAttributes().get("authToken");
            if (authToken != null) {
                TokenContextHolder.setToken(authToken);
                logger.debug("🔐 Token set for join auction");
            }

            logger.info("📊 Join data: {}", joinData);
            logger.info("✅ Successfully joined auction {}", auctionId);

        } catch (Exception e) {
            logger.error("❌ Failed to handle join auction {}: {}", auctionId, e.getMessage());
        } finally {
            TokenContextHolder.clear();
        }
    }
}