package com.rtx.placeintel.security;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.time.Instant;
import java.util.Date;

@Component
@RequiredArgsConstructor
public class JwtRevocationService {

    private static final String KEY_PREFIX = "REVOKED_JWT:";

    private final RedisTemplate<String, String> redisTemplate;
    private final JwtUtil jwtUtil;

    /**
     * Revokes the supplied JWT until the token's natural expiration time.
     *
     * We store only the JWT ID (JTI), not the entire token.
     */
    public void revoke(String token) {

        if (token == null || token.isBlank()) {
            return;
        }

        /*
         * If the token is already expired or otherwise invalid,
         * there is nothing useful to revoke.
         *
         * The logout controller will still clear the browser cookie.
         */
        if (!jwtUtil.isTokenValid(token)) {
            return;
        }

        String jti = jwtUtil.extractJti(token);
        Date expiration = jwtUtil.extractExpiration(token);

        if (jti == null || jti.isBlank() || expiration == null) {
            return;
        }

        long remainingMillis =
                Duration
                        .between(
                                Instant.now(),
                                expiration.toInstant()
                        )
                        .toMillis();

        /*
         * The token is already expired by the time we reach here.
         */
        if (remainingMillis <= 0) {
            return;
        }

        String key = KEY_PREFIX + jti;

        redisTemplate
                .opsForValue()
                .set(
                        key,
                        "revoked",
                        Duration.ofMillis(remainingMillis)
                );
    }

    /**
     * Returns true when the JWT ID has been revoked.
     */
    public boolean isRevoked(String jti) {

        if (jti == null || jti.isBlank()) {
            return false;
        }

        String key = KEY_PREFIX + jti;

        return Boolean.TRUE.equals(
                redisTemplate.hasKey(key)
        );
    }
}