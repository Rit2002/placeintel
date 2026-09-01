package com.rtx.placeintel.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record BulkResourceRequest(
        @NotEmpty
        @Valid
        List<ResourceRequest> resources
) {}