package com.rtx.placeintel.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record UpdateTpoRequest(

        @NotBlank(message = "Full name is required")
        String fullName,

        @NotBlank(message = "Email is required")
        @Email(message = "Email must be valid")
        String email,

        @NotNull(message = "Enabled status is required")
        Boolean enabled
) {}