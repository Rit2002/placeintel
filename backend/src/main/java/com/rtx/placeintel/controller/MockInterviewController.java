package com.rtx.placeintel.controller;

import com.rtx.placeintel.dto.MockInterviewTurnApiRequest;
import com.rtx.placeintel.entity.User;
import com.rtx.placeintel.security.RateLimiter;
import com.rtx.placeintel.service.MockInterviewService;
import com.rtx.placeintel.util.CurrentUserResolver;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

@RestController
@RequestMapping("/placeintel/api/v1")
@RequiredArgsConstructor
public class MockInterviewController {

    private final MockInterviewService mockInterviewService;
    private final RateLimiter rateLimiter;
    private final CurrentUserResolver currentUserResolver;


    @PostMapping(
            value = "/students/me/mock-interview/turn",
            produces = MediaType.TEXT_EVENT_STREAM_VALUE
    )
    @PreAuthorize("hasAnyRole('STUDENT', 'TPO', 'ADMIN')")
    public SseEmitter takeTurn(
            @RequestBody MockInterviewTurnApiRequest req,
            Authentication authentication,
            HttpServletResponse response) {

        User student = currentUserResolver.resolve(authentication);

        if (!rateLimiter.allowRequest(student.getId().toString())) {

            // Same constraint as PrepAgentController: once the
            // response is committed to text/event-stream we
            // can't send a JSON ApiResponse body, so signal via
            // status code and close the emitter.
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());

            SseEmitter emitter = new SseEmitter(0L);
            emitter.complete();
            return emitter;
        }

        return mockInterviewService.takeTurnStream(req);
    }
}