package com.example.auction.client;

import com.example.auction.config.FeignClientConfig;
import com.example.auction.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;

@FeignClient(name = "user-service", configuration = FeignClientConfig.class)
public interface UserClient {
    @GetMapping("/api/users/{id}")
    UserDTO getUserById(@PathVariable("id") Long id);

    @GetMapping("/internal/users/{id}/score")
    Integer getUserScore(@PathVariable("id") Long userId);

    @PutMapping("/internal/users/{id}/deduct-score")
    void deductScore(
            @PathVariable("id") Long userId,
            @RequestParam("amount") int amount
    );
}
