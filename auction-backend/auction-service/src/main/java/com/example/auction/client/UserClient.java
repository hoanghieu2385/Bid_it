package com.example.auction.client;

import com.example.auction.config.FeignClientConfig;
import com.example.auction.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service", configuration = FeignClientConfig.class)
public interface UserClient {
    @GetMapping("/internal/users/{id}")
    UserDTO getUserById(@PathVariable("id") Long id);
}
