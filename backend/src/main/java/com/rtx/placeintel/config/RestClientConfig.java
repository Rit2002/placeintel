package com.rtx.placeintel.config;

import java.time.Duration;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.ReactorClientHttpRequestFactory;
import org.springframework.web.client.RestClient;

@Configuration
public class RestClientConfig {

    @Value("${ai-service.base-url}")
    private String aiServiceBaseUrl;

    @Bean
    public RestClient aiServiceClient() {

        /*
         * Company Research is intentionally NON-STREAMING.
         *
         * The AI service may take longer than Spring/Reactor Netty's
         * default 10-second read timeout because it can perform:
         *
         *   1. Gemini calls
         *   2. Tavily web searches
         *   3. LangGraph tool execution
         *   4. Structured-output generation
         *
         * Allow the AI service up to 2 minutes to complete.
         */
        ReactorClientHttpRequestFactory requestFactory =
                new ReactorClientHttpRequestFactory();

        requestFactory.setReadTimeout(
                Duration.ofMinutes(2)
        );

        return RestClient.builder()
                .baseUrl(aiServiceBaseUrl)
                .requestFactory(requestFactory)
                .build();
    }
}