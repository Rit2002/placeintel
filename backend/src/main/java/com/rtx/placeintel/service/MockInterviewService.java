package com.rtx.placeintel.service;

import com.rtx.placeintel.dto.ApiResponse;
import com.rtx.placeintel.dto.MockInterviewTurnApiRequest;
import com.rtx.placeintel.dto.MockInterviewTurnApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
@RequiredArgsConstructor
public class MockInterviewService {

    private final RestClient aiServiceClient;

    public ApiResponse<MockInterviewTurnApiResponse> takeTurn(MockInterviewTurnApiRequest req) {

        MockInterviewTurnApiResponse result = aiServiceClient.post()
                .uri("/mock-interview/turn")
                .body(req)
                .retrieve()
                .body(MockInterviewTurnApiResponse.class);

        return new ApiResponse<>(
                true,
                "Turn processed",
                result,
                null
        );
    }
}
