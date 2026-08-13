package com.rtx.placeintel.dto;

import com.rtx.placeintel.entity.enums.RoundDifficulty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record RoundRequest(
        @NotBlank
        String roundName,

        @NotNull
        Integer sequenceNumber,

        String description,

        Integer durationMinutes,

        RoundDifficulty difficulty
) {
}
