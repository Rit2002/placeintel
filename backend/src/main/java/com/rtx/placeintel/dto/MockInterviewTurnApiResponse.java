package com.rtx.placeintel.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;
import java.util.Map;

public record MockInterviewTurnApiResponse(
        @JsonProperty("question_number") Integer questionNumber,
        String question,
        @JsonProperty("is_complete") Boolean isComplete,
        @JsonProperty("conversation_history") List<Map<String, String>> conversationHistory,
        InterviewEvaluationDto evaluation
) {}