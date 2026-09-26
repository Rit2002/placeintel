package com.rtx.placeintel.controller;

import com.rtx.placeintel.dto.PrepChatUserRequest;
import com.rtx.placeintel.entity.User;
import com.rtx.placeintel.security.RateLimiter;
import com.rtx.placeintel.service.PrepAgentService;
import com.rtx.placeintel.util.CurrentUserResolver;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.UUID;

@RestController
@RequestMapping("/placeintel/api/v1")
@RequiredArgsConstructor
public class PrepAgentController {

    private final PrepAgentService prepAgentService;
    private final CurrentUserResolver currentUserResolver;
    private final RateLimiter rateLimiter;


    @PostMapping(
            value = "/companies/{companyId}/prep-chat",
            produces = MediaType.TEXT_EVENT_STREAM_VALUE
    )
    @PreAuthorize("hasAnyRole('STUDENT', 'TPO', 'ADMIN')")
    public SseEmitter prepChat(
            @PathVariable UUID companyId,
            @Valid @RequestBody PrepChatUserRequest body,
            Authentication authentication,
            HttpServletResponse response
    ) {

        User student = currentUserResolver.resolve(authentication);

        if (!rateLimiter.allowRequest(student.getId().toString())) {

            // A streaming endpoint can't return a JSON
            // ApiResponse body the way the old one did — the
            // response has already committed to
            // text/event-stream. Signal the rejection via the
            // HTTP status and close the emitter immediately.
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());

            SseEmitter emitter = new SseEmitter(0L);
            emitter.complete();
            return emitter;
        }

        return prepAgentService.chatStream(student, companyId, body.message());
    }

}