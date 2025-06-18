package com.example.bidservice.config;

import com.example.bidservice.context.TokenContextHolder;
import feign.RequestInterceptor;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

@Configuration
public class FeignClientConfig {

    @Bean
    public RequestInterceptor requestInterceptor() {
        return template -> {
            String authToken = null;

            // Thử lấy từ ThreadLocal trước (cho WebSocket)
            authToken = TokenContextHolder.getToken();

            // Nếu không có, thử lấy từ HTTP request (cho REST API)
            if (authToken == null || authToken.trim().isEmpty()) {
                ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
                if (attributes != null) {
                    HttpServletRequest request = attributes.getRequest();
                    authToken = request.getHeader("Authorization");
//                    System.out.println("Token from HTTP request: " + (authToken != null ? authToken.substring(0, Math.min(50, authToken.length())) + "..." : "null"));
                }
            }

            if (authToken != null && !authToken.trim().isEmpty()) {
                // Đảm bảo token có format Bearer
                if (!authToken.startsWith("Bearer ")) {
                    authToken = "Bearer " + authToken;
                }

                template.header("Authorization", authToken);
//                System.out.println("Passing token to Feign: " + authToken.substring(0, Math.min(50, authToken.length())) + "...");
            } else {
//                System.out.println("No token available for Feign request");
            }
        };
    }
}