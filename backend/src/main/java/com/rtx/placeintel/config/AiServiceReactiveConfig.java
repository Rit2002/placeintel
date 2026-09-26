package com.rtx.placeintel.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.reactive.function.client.WebClient;

/**
 * Reactive counterpart to RestClientConfig's blocking
 * aiServiceClient. RestClient cannot stream a response
 * chunk-by-chunk to the browser, so the two streaming
 * endpoints (prep-chat, mock-interview/turn) go through this
 * WebClient instead.
 *
 * Uses the same "ai-service.base-url" property RestClientConfig
 * reads (see application.yml: ai-service.base-url, defaulting
 * to http://localhost:8000 via AI_SERVICE_BASE_URL) so the two
 * clients can't drift apart.
 */
@Configuration
public class AiServiceReactiveConfig {

    @Bean
    public WebClient aiServiceWebClient(
            @Value("${ai-service.base-url}") String baseUrl
    ) {
        return WebClient.builder()
                .baseUrl(baseUrl)
                .build();
    }
}