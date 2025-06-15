package com.example.payment.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "paypal")
public class PayPalProperties {

    private Client client = new Client();
    private String baseUrl;
    private String currency = "USD";
    private Urls urls = new Urls();

    @Data
    public static class Client {
        private String id;
        private String secret;
    }

    @Data
    public static class Urls {
        private String success;
        private String cancel;
    }
}