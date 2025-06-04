package com.example.bidservice.service;

import com.example.bidservice.dto.BidResponse;

public interface IWebSocketService {
    void sendNewBidNotification(BidResponse bidResponse);
    void sendBidStatistics(Long auctionId, IBidService.BidStatistics stats);
    void sendGeneralNotification(String topic, Object payload);
}