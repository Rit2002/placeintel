package com.rtx.placeintel.dto;

import com.rtx.placeintel.entity.enums.Role;

public record AuthResult(
        String token,
        Role role
) {
}
