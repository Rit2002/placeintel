package com.rtx.placeintel.controller;

import com.rtx.placeintel.dto.ApiResponse;
import com.rtx.placeintel.dto.MockInterviewTurnApiRequest;
import com.rtx.placeintel.dto.MockInterviewTurnApiResponse;
import com.rtx.placeintel.entity.User;
import com.rtx.placeintel.security.RateLimiter;
import com.rtx.placeintel.service.MockInterviewService;
import com.rtx.placeintel.util.CurrentUserResolver;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/placeintel/api/v1")
@RequiredArgsConstructor
public class MockInterviewController {

    private final MockInterviewService mockInterviewService;
    private final RateLimiter rateLimiter;
    private final CurrentUserResolver currentUserResolver;

    @PostMapping("/students/me/mock-interview/turn")
    @PreAuthorize("hasAnyRole('STUDENT', 'TPO', 'ADMIN')")
    public ResponseEntity<ApiResponse<MockInterviewTurnApiResponse>> takeTurn(
            @RequestBody MockInterviewTurnApiRequest req,
            Authentication authentication) {

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

        ApiResponse<MockInterviewTurnApiResponse> response = mockInterviewService.takeTurn(req);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }
}
