package com.rtx.placeintel.dto;

import com.rtx.placeintel.entity.enums.ApplicationStatus;

import java.util.UUID;

public record RankedApplicationResponse(
        UUID applicationId,
        String studentName,
        String enrollmentNo,
        Double ruleBasedScore,
        ApplicationStatus status
) {}