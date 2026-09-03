package com.rtx.placeintel.security;

import lombok.RequiredArgsConstructor;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.stereotype.Component;

import java.time.Duration;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class RateLimiter {

    // This is connection/interface to Redis.
    //Used it to perform Redis operations
    private final RedisTemplate<String, String> redisTemplate;

    private static final long WINDOW_SIZE_SECONDS = 600; // 1 hr window
    private static final long MAX_REQUESTS = 20;
    private static final long THROTTLE_SECONDS = 2;

    public boolean allowRequest(String identifier) {
        // Student ID as redis key
        String key = "STUDENT_ID:" + identifier;

        // Gets current time and converts into seconds
        double currentTime = System.currentTimeMillis() / 1000.0;

        // Calculate the 1 hr before current time.
        // windowStart = 10000 - 3600 = 6400
        // 6400 ---------------- 10000
        //       last 1 hour
        // This is a rolling/sliding window
        double windowStart = currentTime - WINDOW_SIZE_SECONDS;

        // This gives you methods for working with Redis Sorted Sets.
        ZSetOperations<String, String> zSetOps = redisTemplate.opsForZSet();

        // This removes all requests whose score is between: 0 → windowStart
        // Redis only keeps requests from approximately the last hour.
        zSetOps.removeRangeByScore(key, 0, windowStart);

        // zCard() returns the number of members in the Sorted Set.
        Long numberOfRequests = zSetOps.zCard(key);

        // Calculate the 5-second throttle window
        double throttleWindowStart = currentTime - THROTTLE_SECONDS;

        /*This asks Redis: "How many requests does this student have whose timestamps are between the last 5 seconds and now?"*/
        Long recentRequests = zSetOps.count(key, throttleWindowStart, currentTime);

        if((numberOfRequests != null && numberOfRequests > MAX_REQUESTS)
                || (recentRequests != null && recentRequests > 0)) {
            return false;
        }

        // Add a new request to redis
        // multiple requests could theoretically have the same timestamp.So randomUUID is appended with current time
        String uniqueMember = currentTime + ":" + UUID.randomUUID();
        zSetOps.add(key, uniqueMember, currentTime);

        // Deletes the entire key after 1 hour.
        redisTemplate.expire(
                key,
                Duration.ofSeconds(WINDOW_SIZE_SECONDS)
        );

        return true;
    }
}
