package com.rtx.placeintel.service;

import com.rtx.placeintel.dto.PrepChatRequest;
import com.rtx.placeintel.entity.StudentProfile;
import com.rtx.placeintel.entity.User;
import com.rtx.placeintel.exception.ResourceNotFound;
import com.rtx.placeintel.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.http.codec.ServerSentEvent;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PrepAgentService {

    private final WebClient aiServiceWebClient;
    private final StudentProfileRepository studentProfileRepository;

    /**
     * Streams the prep-chat reply from the Python AI service to
     * the caller as it is generated, instead of waiting for the
     * full answer.
     * The AI service's /prep-chat is now itself an SSE endpoint
     * (see main.py): it emits `data: <token>` lines for each
     * chunk of the reply, an optional `event: tool` line while
     * a tool call is in flight, and finishes with
     * `data: [DONE]`. This method just relays those events
     * verbatim to the frontend's SseEmitter — it does not need
     * to understand the token content, only forward it.
     */
    public SseEmitter chatStream(User student, UUID companyId, String userMessage) {

        StudentProfile profile = studentProfileRepository.findByUserId(student.getId())
                .orElseThrow(() -> new ResourceNotFound("Student profile not found"));

        PrepChatRequest payload = new PrepChatRequest(
                companyId,
                profile.getId(),
                userMessage
        );

        // No timeout (0L) — LLM latency varies and the stream
        // itself is the liveness signal.
        SseEmitter emitter = new SseEmitter(0L);

        aiServiceWebClient.post()
                .uri("/prep-chat")
                .accept(MediaType.TEXT_EVENT_STREAM)
                .bodyValue(payload)
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