package com.rtx.placeintel.dto;

import com.rtx.placeintel.entity.enums.ResourceType;

public record ResearchedResource(
        ResourceType type,
        String title,
        String url
) {}
