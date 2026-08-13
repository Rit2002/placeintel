package com.rtx.placeintel.dto;

import com.rtx.placeintel.entity.enums.RoundDifficulty;

import java.util.UUID;

public record RoundResponse(
        UUID id,
        String roundName,
        Integer sequenceNumber,
        String description,
        Integer durationMinutes,
        RoundDifficulty difficulty
) {
}
