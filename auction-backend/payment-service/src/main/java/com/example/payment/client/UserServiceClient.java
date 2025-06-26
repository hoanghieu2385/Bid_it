package com.example.payment.client;

import com.example.payment.dto.UserDto;
import com.example.payment.config.FeignClientConfig; // thêm import này
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@FeignClient(name = "user-service", configuration = FeignClientConfig.class)
public interface UserServiceClient {

    @GetMapping("/internal/users/{id}")
    UserDto getUserById(@PathVariable("id") Long id);
}
