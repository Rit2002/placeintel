package com.rtx.placeintel.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.List;

public record InterviewEvaluationDto(
        @JsonProperty("overall_score") Integer overallScore,
        @JsonProperty("overall_feedback") String overallFeedback,
        @JsonProperty("per_question_feedback") List<QuestionFeedbackDto> perQuestionFeedback,
        @JsonProperty("key_strengths") List<String> keyStrengths,
        @JsonProperty("key_improvement_areas") List<String> keyImprovementAreas
) {}
