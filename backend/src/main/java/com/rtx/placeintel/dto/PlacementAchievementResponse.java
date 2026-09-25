package com.rtx.placeintel.dto;

import java.time.LocalDateTime;
import java.util.UUID;

public record PlacementAchievementResponse(
        UUID id,
        UUID studentProfileId,
        String studentName,
        String branch,
        String companyName,
        Double ctcOffered,
        String imageUrl,
        LocalDateTime createdAt
) {
}
