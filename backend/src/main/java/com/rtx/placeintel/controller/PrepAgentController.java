package com.rtx.placeintel.controller;

import com.rtx.placeintel.dto.ApiResponse;
import com.rtx.placeintel.dto.PrepChatResponse;
import com.rtx.placeintel.dto.PrepChatUserRequest;
import com.rtx.placeintel.entity.User;
import com.rtx.placeintel.security.RateLimiter;
import com.rtx.placeintel.service.PrepAgentService;
import com.rtx.placeintel.util.CurrentUserResolver;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/placeintel/api/v1")
@RequiredArgsConstructor
public class PrepAgentController {

    private final PrepAgentService prepAgentService;
    private final CurrentUserResolver currentUserResolver;
    private final RateLimiter rateLimiter;



    @PostMapping("/companies/{companyId}/prep-chat")
    @PreAuthorize("hasAnyRole('STUDENT', 'TPO', 'ADMIN')")
    public ResponseEntity<ApiResponse<PrepChatResponse>> prepChat(
            @PathVariable UUID companyId,
            @Valid @RequestBody PrepChatUserRequest body,
            Authentication authentication
    ) {

        User student = currentUserResolver.resolve(authentication);

        if(!rateLimiter.allowRequest(student.getId().toString())) {

            return ResponseEntity
                    .status(HttpStatus.TOO_MANY_REQUESTS)
                    .body(new ApiResponse<>(
                            false,
                            "Too many requests. Please wait a moment and try again.",
                            null,
                            "RATE_LIMITED"
                    ));
        }

        ApiResponse<PrepChatResponse> response =
                prepAgentService.chat(student, companyId, body.message());

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }


}
