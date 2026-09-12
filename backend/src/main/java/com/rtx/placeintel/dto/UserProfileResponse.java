package com.rtx.placeintel.dto;

public record UserProfileResponse(
        String fullName,
        String email,
        String role
) {}