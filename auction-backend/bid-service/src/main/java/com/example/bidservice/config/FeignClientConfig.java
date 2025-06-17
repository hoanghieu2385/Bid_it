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
            if (authToken == null) {
                ServletRequestAttributes attributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
                if (attributes != null) {
                    HttpServletRequest request = attributes.getRequest();
                    authToken = request.getHeader("Authorization");
                }
            }

            if (authToken != null) {
                template.header("Authorization", authToken);
            }
        };
    }
}