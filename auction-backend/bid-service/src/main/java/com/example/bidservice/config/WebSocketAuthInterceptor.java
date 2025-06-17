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

        if (accessor != null && StompCommand.CONNECT.equals(accessor.getCommand())) {
            // Lấy token từ header khi connect
            String authToken = accessor.getFirstNativeHeader("Authorization");
            if (authToken != null) {
                // Lưu token vào session attributes
                accessor.getSessionAttributes().put("authToken", authToken);
            }
        } else if (accessor != null && accessor.getSessionAttributes() != null) {
            // Đối với các message khác, lấy token từ session và set vào ThreadLocal
            String authToken = (String) accessor.getSessionAttributes().get("authToken");
            if (authToken != null) {
                TokenContextHolder.setToken(authToken);
            }
        }

        return message;
    }

    @Override
    public void postSend(Message<?> message, MessageChannel channel, boolean sent) {
        // Clear ThreadLocal sau khi xử lý xong
        TokenContextHolder.clear();
    }
}