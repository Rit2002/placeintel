package com.rtx.placeintel.dto;

import jakarta.validation.constraints.*;

import java.util.List;

public record CompleteProfileRequest(

        @NotBlank
        String department,

        @NotNull
        @DecimalMin("0.0")
        @DecimalMax("10.0")
        Double cgpa,

        @NotNull
        @DecimalMin("0.0")
        @DecimalMax("100.0")
        Double tenthPercentage,

        @NotNull
        @DecimalMin("0.0")
        @DecimalMax("100.0")
        Double twelfthPercentage,

        @NotNull
        @Min(0)
        Integer activeBacklogs,

        List<String> skills,

        String linkedinUrl,

        String githubUsername,

        String resumeUrl
) {}