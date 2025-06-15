package com.example.payment.config;

import feign.Response;
import feign.codec.ErrorDecoder;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

@Slf4j
public class CustomFeignErrorDecoder implements ErrorDecoder {

    private final ErrorDecoder defaultErrorDecoder = new Default();

    @Override
    public Exception decode(String methodKey, Response response) {
        log.error("Feign client error: {} - Status: {}", methodKey, response.status());

        switch (response.status()) {
            case 404:
                if (methodKey.contains("getAuctionById")) {
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "Auction not found");
                } else if (methodKey.contains("getUserById")) {
                    return new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found");
                }
                break;
            case 500:
                return new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Internal server error from external service");
            default:
                return defaultErrorDecoder.decode(methodKey, response);
        }

        return defaultErrorDecoder.decode(methodKey, response);
    }
}