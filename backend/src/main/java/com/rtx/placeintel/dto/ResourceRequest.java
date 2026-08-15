package com.rtx.placeintel.dto;

import com.rtx.placeintel.entity.enums.ResourceType;
import jakarta.validation.constraints.NotNull;

public record ResourceRequest(

       @NotNull ResourceType resourceType,

       @NotNull String title,

       @NotNull String url
) {
}
