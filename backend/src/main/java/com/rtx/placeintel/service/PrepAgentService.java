package com.rtx.placeintel.service;

import com.rtx.placeintel.config.RestClientConfig;
import com.rtx.placeintel.dto.ApiResponse;
import com.rtx.placeintel.dto.PrepChatRequest;
import com.rtx.placeintel.dto.PrepChatResponse;
import com.rtx.placeintel.entity.StudentProfile;
import com.rtx.placeintel.entity.User;
import com.rtx.placeintel.exception.ResourceNotFound;
import com.rtx.placeintel.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PrepAgentService {



    private final RestClientConfig restClientConfig;
    private final StudentProfileRepository studentProfileRepository;



    public ApiResponse<PrepChatResponse> chat(User student, UUID companyId, String userMessage) {

        StudentProfile profile = studentProfileRepository.findByUserId(student.getId())
                .orElseThrow(() -> new ResourceNotFound("Student profile not found"));


        PrepChatRequest payload = new PrepChatRequest(
                companyId,
                profile.getId(),
                userMessage
        );

        RestClient aiServiceClient = restClientConfig.aiServiceClient();

        PrepChatResponse result = aiServiceClient.post()
                .uri("/prep-chat")
                .body(payload)
                .retrieve()
                .body(PrepChatResponse.class);

        return new ApiResponse<>(
                true,
                "Response generated",
                result,
                null
        );
    }
}