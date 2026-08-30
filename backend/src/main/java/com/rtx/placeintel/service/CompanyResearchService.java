package com.rtx.placeintel.service;

import com.rtx.placeintel.dto.ApiResponse;
import com.rtx.placeintel.dto.CompanyResearchApiRequest;
import com.rtx.placeintel.dto.CompanyResearchApiResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

@Service
@RequiredArgsConstructor
public class CompanyResearchService {

    private final RestClient aiServiceClient;

    public ApiResponse<CompanyResearchApiResponse> research(String companyName, String role) {

        CompanyResearchApiRequest payload = new CompanyResearchApiRequest(companyName, role);

        CompanyResearchApiResponse response = aiServiceClient.post()
                .uri("/research-company")
                .body(payload)
                .retrieve()
                .body(CompanyResearchApiResponse.class);

        return new ApiResponse<>(
                true,
                "Research completed",
                response,
                null
        );
    }
}
