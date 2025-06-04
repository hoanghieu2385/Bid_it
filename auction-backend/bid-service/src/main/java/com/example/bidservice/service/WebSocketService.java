package com.example.bidservice.service;

import com.example.bidservice.dto.BidResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketService implements IWebSocketService {
    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public void sendNewBidNotification(BidResponse bidResponse) {
        messagingTemplate.convertAndSend("/topic/auction/" + bidResponse.getAuctionId() + "/bids", bidResponse);
        messagingTemplate.convertAndSend("/topic/bids/new", bidResponse);
    }

    @Override
    public void sendBidStatistics(Long auctionId, IBidService.BidStatistics stats) {
        messagingTemplate.convertAndSend("/topic/auction/" + auctionId + "/stats", stats);
    }

    @Override
    public void sendGeneralNotification(String topic, Object payload) {
        messagingTemplate.convertAndSend(topic, payload);
    }
}