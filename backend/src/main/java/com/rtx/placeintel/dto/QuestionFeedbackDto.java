package com.rtx.placeintel.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

public record QuestionFeedbackDto(
        String question,
        @JsonProperty("answer_summary") String answerSummary,
        String strengths,
        @JsonProperty("improvement_areas") String improvementAreas
) {}