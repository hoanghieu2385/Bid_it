package com.example.bidservice.service;

import com.example.bidservice.dto.BidResponse;

import java.math.BigDecimal;

public interface IWebSocketService {
    void sendNewBidNotification(BidResponse bidResponse);
    void sendBidStatistics(Long auctionId, IBidService.BidStatistics stats);
    void sendGeneralNotification(String topic, Object payload);
    void sendOutbidNotification(Long userId, Long auctionId, BigDecimal newHighestBid);
    void sendAuctionEndNotification(BidResponse winningBid);
    void sendBidFailed(Long userId, Long auctionId, String errorMessage);
    void sendBidHistoryUpdate(Long auctionId, BidResponse bidResponse);

}