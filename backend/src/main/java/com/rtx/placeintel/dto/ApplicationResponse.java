package com.rtx.placeintel.dto;

import com.rtx.placeintel.entity.enums.ApplicationStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public record ApplicationResponse(
        UUID id,
        UUID driveId,
        String roleOffered,
        String companyName,
        ApplicationStatus status,
        LocalDateTime appliedAt
) {}