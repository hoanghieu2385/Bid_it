package com.example.bidservice.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authz -> authz
                        // Cho phép các endpoint public
                        .requestMatchers("/api/bids/health").permitAll()
                        .requestMatchers("/actuator/**").permitAll()
                        .requestMatchers("/ws/**").permitAll()
                        .requestMatchers("/ws-direct/**").permitAll()
                        // Tạm thời cho phép tất cả để test
                        .requestMatchers("/api/bids/**").permitAll()
                        .anyRequest().authenticated()
                );

        return http.build();
    }
}