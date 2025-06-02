package com.example.bid.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;

import javax.crypto.SecretKey;

public class JwtUtil {

    private static final String SECRET_KEY = "YourSecretKeyThatIsAtLeast32CharactersLong!";

    private static SecretKey getKey() {
        return Keys.hmacShaKeyFor(SECRET_KEY.getBytes());
    }

    public static Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(getKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    public static String extractUserId(String token) {
        return extractClaims(token).getSubject(); // assuming subject = user ID or email
    }
}