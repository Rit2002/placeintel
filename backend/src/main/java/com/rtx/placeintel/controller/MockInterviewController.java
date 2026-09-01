package com.rtx.placeintel.controller;

import com.rtx.placeintel.dto.ApiResponse;
import com.rtx.placeintel.dto.MockInterviewTurnApiRequest;
import com.rtx.placeintel.dto.MockInterviewTurnApiResponse;
import com.rtx.placeintel.service.MockInterviewService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/placeintel/api/v1")
@RequiredArgsConstructor
public class MockInterviewController {

    private final MockInterviewService mockInterviewService;

    @PostMapping("/students/me/mock-interview/turn")
    @PreAuthorize("hasAnyRole('STUDENT', 'TPO', 'ADMIN')")
    public ResponseEntity<ApiResponse<MockInterviewTurnApiResponse>> takeTurn(
            @RequestBody MockInterviewTurnApiRequest req) {

        ApiResponse<MockInterviewTurnApiResponse> response = mockInterviewService.takeTurn(req);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }
}
