package com.example.bid.client;

import com.example.bid.dto.UserDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service", configuration = com.example.bid.config.FeignClientInterceptorConfig.class)
public interface UserClient {

    @GetMapping("/api/users/{id}")
    UserDTO getUserById(@PathVariable("id") Long id);
}
