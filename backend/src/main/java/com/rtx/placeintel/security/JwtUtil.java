package com.rtx.placeintel.security;

import com.rtx.placeintel.entity.enums.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    private SecretKey signingKey() {

        /*
         * Cryptographic operations work on bytes, not Strings.
         *
         * Explicit UTF-8 ensures the same secret produces the
         * same byte representation across environments.
         */
        return Keys.hmacShaKeyFor(
                secret.getBytes(StandardCharsets.UTF_8)
        );
    }

    public String generateToken(String email, Role role) {

        Date now = new Date();

        Date expiry =
                new Date(
                        now.getTime() + expirationMs
                );

        /*
         * Every issued JWT receives a unique JTI.
         *
         * The JTI identifies this specific authentication session.
         *
         * Example:
         *
         * {
         *   "sub": "ritesh@example.com",
         *   "role": "STUDENT",
         *   "jti": "550e8400-e29b-41d4-a716-446655440000",
         *   "iat": "...",
         *   "exp": "..."
         * }
         */
        return Jwts.builder()
                .subject(email)
                .claim("role", role.name())
                .id(UUID.randomUUID().toString())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey())
                .compact();
    }

    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return parseClaims(token)
                .get("role", String.class);
    }

    public String extractJti(String token) {
        return parseClaims(token).getId();
    }

    public Date extractExpiration(String token) {
        return parseClaims(token).getExpiration();
    }

    public boolean isTokenValid(String token) {

        try {

            parseClaims(token);

            return true;

        } catch (
                JwtException |
                IllegalArgumentException e
        ) {

            return false;
        }
    }

    private Claims parseClaims(String token) {

        return Jwts
                .parser()
                .verifyWith(signingKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}