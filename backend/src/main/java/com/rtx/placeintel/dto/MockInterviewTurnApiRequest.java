package com.rtx.placeintel.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record MockInterviewTurnApiRequest(
        @JsonProperty("company_id") UUID companyId,
        @JsonProperty("student_id") UUID studentId,
        @JsonProperty("round_type") String roundType,
        @JsonProperty("conversation_history") List<Map<String, String>> conversationHistory,
        @JsonProperty("student_answer") String studentAnswer
) {}

