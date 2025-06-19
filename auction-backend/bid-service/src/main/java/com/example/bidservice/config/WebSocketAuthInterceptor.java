package com.example.bidservice.config;

import com.example.bidservice.context.TokenContextHolder;
import org.springframework.messaging.Message;
import org.springframework.messaging.MessageChannel;
import org.springframework.messaging.simp.stomp.StompCommand;
import org.springframework.messaging.simp.stomp.StompHeaderAccessor;
import org.springframework.messaging.support.ChannelInterceptor;
import org.springframework.messaging.support.MessageHeaderAccessor;
import org.springframework.stereotype.Component;

@Component
public class WebSocketAuthInterceptor implements ChannelInterceptor {

    @Override
    public Message<?> preSend(Message<?> message, MessageChannel channel) {
        StompHeaderAccessor accessor = MessageHeaderAccessor.getAccessor(message, StompHeaderAccessor.class);

        if (accessor != null) {
            if (StompCommand.CONNECT.equals(accessor.getCommand())) {
                String authToken = accessor.getFirstNativeHeader("Authorization");
//                System.out.println("STOMP CONNECT received token: " + authToken);

                if (authToken != null) {
                    // Đảm bảo token có format Bearer
                    if (!authToken.startsWith("Bearer ")) {
                        authToken = "Bearer " + authToken;
                    }

                    // Lưu vào session attributes
                    accessor.getSessionAttributes().put("authToken", authToken);

                    // Set vào ThreadLocal
                    TokenContextHolder.setToken(authToken);
                    System.out.println("Token set into TokenContextHolder: " + authToken);
                }
            } else {
                // Với các message khác, lấy token từ session và set vào ThreadLocal
                String authToken = (String) accessor.getSessionAttributes().get("authToken");
                if (authToken != null) {
                    TokenContextHolder.setToken(authToken);
//                    System.out.println("Reused token from session: " + authToken);
                } else {
//                    System.out.println("No token found in session for command: " + accessor.getCommand());
                }
            }
        }

        return message;
    }

    @Override
    public void postSend(Message<?> message, MessageChannel channel, boolean sent) {
        // Không clear ThreadLocal ở đây vì có thể còn cần dùng trong cùng thread
        // TokenContextHolder.clear();
    }

    @Override
    public void afterSendCompletion(Message<?> message, MessageChannel channel, boolean sent, Exception ex) {
        // Clear ThreadLocal sau khi hoàn thành xử lý
        TokenContextHolder.clear();
    }
}