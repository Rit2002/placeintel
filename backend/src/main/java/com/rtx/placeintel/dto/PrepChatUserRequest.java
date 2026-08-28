package com.rtx.placeintel.dto;

import jakarta.validation.constraints.NotBlank;

public record PrepChatUserRequest(
        @NotBlank String message
) {}