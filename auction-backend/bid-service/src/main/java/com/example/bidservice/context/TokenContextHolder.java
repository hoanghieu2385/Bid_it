package com.example.bidservice.context;

public class TokenContextHolder {
    private static final ThreadLocal<String> tokenHolder = new ThreadLocal<>();

    public static void setToken(String token) {
        if (token != null && !token.trim().isEmpty()) {
            tokenHolder.set(token);
//            System.out.println("Token set in ThreadLocal: " + token.substring(0, Math.min(50, token.length())) + "...");
        }
    }

    public static String getToken() {
        String token = tokenHolder.get();
        if (token != null) {
//            System.out.println("Token retrieved from ThreadLocal: " + token.substring(0, Math.min(50, token.length())) + "...");
        } else {
//            System.out.println("No token found in ThreadLocal");
        }
        return token;
    }

    public static void clear() {
        tokenHolder.remove();
//        System.out.println("Token cleared from ThreadLocal");
    }
}