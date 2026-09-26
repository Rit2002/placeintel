package com.rtx.placeintel.service;

import com.rtx.placeintel.dto.MockInterviewTurnApiRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class MockInterviewService {

    private final WebClient aiServiceWebClient;

    /**
     * Streams a mock-interview turn from the Python AI service.
     *
     * The AI service's /mock-interview/turn now emits a series
     * of `data: {"type":"token","text":"..."}` events as the
     * question is generated, an optional `event: tool` line,
     * and a final `data: {"type":"done", ...}` event carrying
     * the same fields the old MockInterviewTurnApiResponse
     * carried (question_number, is_complete,
     * conversation_history, evaluation). This method relays
     * those events verbatim — the frontend is responsible for
     * branching on the JSON "type" field.
     */
    public SseEmitter takeTurnStream(MockInterviewTurnApiRequest req) {

        SseEmitter emitter = new SseEmitter(0L);

        aiServiceWebClient.post()
                .uri("/mock-interview/turn")
                .accept(MediaType.TEXT_EVENT_STREAM)
                .bodyValue(req)
                .retrieve()
                .bodyToFlux(new ParameterizedTypeReference<ServerSentEvent<String>>() {})
                .subscribe(
                        sse -> forward(emitter, sse),
                        emitter::completeWithError,
                        emitter::complete
                );

        return emitter;
    }

    private void forward(SseEmitter emitter, ServerSentEvent<String> sse) {
        try {
            SseEmitter.SseEventBuilder event = SseEmitter.event().data(sse.data());

            if (sse.event() != null) {
                event.name(sse.event());
            }

            emitter.send(event);
        } catch (IOException e) {
            emitter.completeWithError(e);
        }
    }
}