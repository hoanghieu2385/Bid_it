package com.example.bidservice.service;

import com.example.bidservice.dto.BidNotification;
import com.example.bidservice.dto.BidResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class WebSocketService implements IWebSocketService {

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public void sendNewBidNotification(BidResponse bidResponse) {
        BidNotification notification = BidNotification.newBid(bidResponse.getAuctionId(), bidResponse);

        // Gửi broadcast tới tất cả user đang theo dõi phiên đấu giá
        messagingTemplate.convertAndSend(
                "/topic/auction/" + bidResponse.getAuctionId() + "/bids",
                notification
        );
    }

    @Override
    public void sendBidFailed(Long userId, Long auctionId, String errorMessage) {
        BidNotification notification = BidNotification.bidFailed(auctionId, errorMessage);
        messagingTemplate.convertAndSend(
                "/user/" + userId + "/queue/auction/" + auctionId + "/errors",
                notification
        );
    }


    @Override
    public void sendOutbidNotification(Long userId, Long auctionId, BigDecimal newHighestBid) {
        BidNotification notification = BidNotification.outbid(auctionId, newHighestBid);
        messagingTemplate.convertAndSend(
                "/user/" + userId + "/queue/auction/" + auctionId + "/outbid",
                notification
        );
    }

    @Override
    public void sendAuctionEndNotification(BidResponse winningBid) {
        BidNotification notification = BidNotification.auctionEnd(winningBid.getAuctionId(), winningBid);
        messagingTemplate.convertAndSend(
                "/topic/auction/" + winningBid.getAuctionId() + "/winner",
                notification
        );
    }

    @Override
    public void sendBidStatistics(Long auctionId, IBidService.BidStatistics stats) {
        messagingTemplate.convertAndSend("/topic/auction/" + auctionId + "/stats", stats);
    }

    @Override
    public void sendGeneralNotification(String topic, Object payload) {
        messagingTemplate.convertAndSend(topic, payload);
    }

    @Override
    public void sendBidHistoryUpdate(Long auctionId, BidResponse bid) {
        messagingTemplate.convertAndSend("/topic/auction/" + auctionId + "/history", bid);
    }

}
