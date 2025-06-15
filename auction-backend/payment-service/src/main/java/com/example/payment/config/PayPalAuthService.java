package com.example.payment.config;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.Base64;

@Slf4j
@Service
@RequiredArgsConstructor
public class PayPalAuthService {

    private final WebClient paypalWebClient;
    private final PayPalConfig payPalConfig;

    @Cacheable(value = "paypalToken", unless = "#result == null")
    public String getAccessToken() {
        try {
            String auth = Base64.getEncoder()
                    .encodeToString((payPalConfig.getClientId() + ":" + payPalConfig.getClientSecret()).getBytes());

            MultiValueMap<String, String> formData = new LinkedMultiValueMap<>();
            formData.add("grant_type", "client_credentials");

            PayPalTokenResponse response = paypalWebClient
                    .post()
                    .uri("/v1/oauth2/token")
                    .header("Authorization", "Basic " + auth)
                    .contentType(MediaType.APPLICATION_FORM_URLENCODED)
                    .body(BodyInserters.fromFormData(formData))
                    .retrieve()
                    .bodyToMono(PayPalTokenResponse.class)
                    .block();

            if (response != null && response.getAccessToken() != null) {
                log.info("PayPal access token obtained successfully");
                return response.getAccessToken();
            } else {
                log.error("Failed to obtain PayPal access token");
                throw new RuntimeException("Failed to obtain PayPal access token");
            }
        } catch (Exception e) {
            log.error("Error obtaining PayPal access token", e);
            throw new RuntimeException("Error obtaining PayPal access token", e);
        }
    }

    @Data
    public static class PayPalTokenResponse {
        @JsonProperty("access_token")
        private String accessToken;

        @JsonProperty("token_type")
        private String tokenType;

        @JsonProperty("expires_in")
        private Integer expiresIn;
    }
}