package com.rtx.placeintel.dto;

import com.rtx.placeintel.entity.enums.VerificationStatus;
import jakarta.validation.constraints.NotNull;

public record VerifyStudentRequest(
        @NotNull
        VerificationStatus status,

        String note
) {}