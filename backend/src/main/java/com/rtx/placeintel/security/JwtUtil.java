package com.rtx.placeintel.security;

import com.rtx.placeintel.entity.Role;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;

@Component
public class JwtUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration-ms}")
    private long expirationMs;

    private SecretKey signingKey() {
        /*
        * Why specify UTF_8 explicitly instead of just .getBytes()?
        * ans : Because .getBytes() alone uses the platform's default charset, which varies by OS/JVM config. If your key is encoded differently on your dev machine vs. a deployment server, the same secret string would produce different byte arrays — meaning tokens signed on one machine would fail verification on another
        *
        * cryptographic operations don't work on String objects, they work on raw bytes.
        *
        *
        * */
        return Keys.hmacShaKeyFor(secret.getBytes((StandardCharsets.UTF_8)));
    }

    public String generateToken(String email, Role role) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);

       /* {
        This sets the "sub" claim — a registered/standard claim defined by the JWT spec itself (RFC 7519)
            "sub": "ritesh@example.com",
                "role": "STUDENT",
                "iat": 1735900000,
                "exp": 1735903600
        }*/

        return Jwts.builder()
                .subject(email)
                .claim("role", role.name())
                .issuedAt(now)
                .expiration(expiry)
                .signWith(signingKey())
                .compact();
    }

    public String extractEmail(String token) {
        return parseClaims(token).getSubject();
    }

    public String extractRole(String token) {
        return parseClaims(token).get("role", String.class);
    }


    public boolean isTokenValid(String token) {
        try {
            parseClaims(token);
            return true;
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims parseClaims(String token) {
        return Jwts.parser()
                .verifyWith(signingKey())
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
