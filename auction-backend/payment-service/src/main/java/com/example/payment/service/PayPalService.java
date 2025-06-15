package com.example.payment.service;

import com.example.payment.config.PayPalAuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class PayPalService implements IPayPalService {

    private final WebClient paypalWebClient;
    private final PayPalAuthService payPalAuthService;

    @Value("${paypal.currency:USD}")
    private String defaultCurrency;

    @Override
    public String createPayPalOrder(BigDecimal amount, String currency, String returnUrl, String cancelUrl, String description) {
        try {
            String accessToken = payPalAuthService.getAccessToken();

            // Tạo request body cho PayPal Order
            Map<String, Object> orderRequest = new HashMap<>();
            orderRequest.put("intent", "CAPTURE");

            // Purchase units
            Map<String, Object> purchaseUnit = new HashMap<>();
            Map<String, Object> amountObj = new HashMap<>();
            amountObj.put("currency_code", currency != null ? currency : defaultCurrency);
            amountObj.put("value", amount.toString());
            purchaseUnit.put("amount", amountObj);
            if (description != null) {
                purchaseUnit.put("description", description);
            }
            orderRequest.put("purchase_units", List.of(purchaseUnit));

            // Application context (redirect URLs)
            if (returnUrl != null || cancelUrl != null) {
                Map<String, Object> applicationContext = new HashMap<>();
                if (returnUrl != null) applicationContext.put("return_url", returnUrl);
                if (cancelUrl != null) applicationContext.put("cancel_url", cancelUrl);
                orderRequest.put("application_context", applicationContext);
            }

            // Call PayPal API
            Map<String, Object> response = paypalWebClient
                    .post()
                    .uri("/v2/checkout/orders")
                    .header("Authorization", "Bearer " + accessToken)
                    .bodyValue(orderRequest)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .onErrorMap(ex -> new RuntimeException("PayPal API error: " + ex.getMessage()))
                    .block();

            if (response != null && response.get("id") != null) {
                String orderId = (String) response.get("id");
                log.info("PayPal order created successfully: {}", orderId);
                return orderId;
            } else {
                throw new RuntimeException("PayPal order creation failed - no order ID returned");
            }

        } catch (Exception e) {
            log.error("Error creating PayPal order: {}", e.getMessage());
            throw new RuntimeException("Failed to create PayPal order: " + e.getMessage());
        }
    }

    @Override
    public String executePayPalPayment(String orderId, String payerId) {
        try {
            String accessToken = payPalAuthService.getAccessToken();

            // Call PayPal Capture API
            Map<String, Object> response = paypalWebClient
                    .post()
                    .uri("/v2/checkout/orders/" + orderId + "/capture")
                    .header("Authorization", "Bearer " + accessToken)
                    .bodyValue(new HashMap<>()) // Empty body
                    .retrieve()
                    .bodyToMono(Map.class)
                    .onErrorMap(ex -> new RuntimeException("PayPal capture error: " + ex.getMessage()))
                    .block();

            if (response != null) {
                // Extract transaction ID from response
                List<Map<String, Object>> purchaseUnits = (List<Map<String, Object>>) response.get("purchase_units");
                if (purchaseUnits != null && !purchaseUnits.isEmpty()) {
                    Map<String, Object> payments = (Map<String, Object>) purchaseUnits.get(0).get("payments");
                    if (payments != null) {
                        List<Map<String, Object>> captures = (List<Map<String, Object>>) payments.get("captures");
                        if (captures != null && !captures.isEmpty()) {
                            String transactionId = (String) captures.get(0).get("id");
                            log.info("PayPal payment captured successfully: {}", transactionId);
                            return transactionId;
                        }
                    }
                }
            }
            throw new RuntimeException("Transaction ID not found in PayPal response");

        } catch (Exception e) {
            log.error("Error executing PayPal payment: {}", e.getMessage());
            throw new RuntimeException("Failed to execute PayPal payment: " + e.getMessage());
        }
    }

    @Override
    public String getApprovalUrl(String orderId) {
        try {
            String accessToken = payPalAuthService.getAccessToken();

            // Get order details
            Map<String, Object> response = paypalWebClient
                    .get()
                    .uri("/v2/checkout/orders/" + orderId)
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .onErrorMap(ex -> new RuntimeException("PayPal get order error: " + ex.getMessage()))
                    .block();

            if (response != null) {
                List<Map<String, Object>> links = (List<Map<String, Object>>) response.get("links");
                if (links != null) {
                    for (Map<String, Object> link : links) {
                        if ("approve".equals(link.get("rel"))) {
                            String approvalUrl = (String) link.get("href");
                            log.info("PayPal approval URL obtained: {}", approvalUrl);
                            return approvalUrl;
                        }
                    }
                }
            }
            throw new RuntimeException("Approval URL not found in PayPal response");

        } catch (Exception e) {
            log.error("Error getting approval URL: {}", e.getMessage());
            throw new RuntimeException("Failed to get approval URL: " + e.getMessage());
        }
    }

    @Override
    public boolean verifyPayPalPayment(String transactionId) {
        try {
            String accessToken = payPalAuthService.getAccessToken();

            // Verify transaction
            Map<String, Object> response = paypalWebClient
                    .get()
                    .uri("/v2/payments/captures/" + transactionId)
                    .header("Authorization", "Bearer " + accessToken)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .onErrorReturn(new HashMap<>()) // Return empty map on error
                    .block();

            boolean isValid = response != null && response.get("id") != null;
            log.info("PayPal payment verification for {}: {}", transactionId, isValid);
            return isValid;

        } catch (Exception e) {
            log.error("Error verifying PayPal payment: {}", e.getMessage());
            return false;
        }
    }

    @Override
    public String getAccessToken() {
        return payPalAuthService.getAccessToken();
    }

    @Override
    public String refundPayPalPayment(String transactionId, BigDecimal amount, String currency) {
        // TODO: Implement refund logic cho tương lai
        log.info("Refund requested for transaction: {}, amount: {}", transactionId, amount);
        throw new UnsupportedOperationException("Refund functionality not implemented yet");
    }
}