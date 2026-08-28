package com.rtx.placeintel.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.UUID;

public record PrepChatRequest(
        @JsonProperty("company_id") UUID companyId,
        @JsonProperty("student_id") UUID studentId,
        @JsonProperty("user_message") String userMessage
) {}