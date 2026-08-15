package com.rtx.placeintel.dto;

import com.rtx.placeintel.entity.enums.ResourceType;

import java.time.LocalDateTime;
import java.util.UUID;

public record ResourceResponse(

        UUID id,

        ResourceType resourceType,

        String title,

        String url,

        LocalDateTime createdAt
) {
}
