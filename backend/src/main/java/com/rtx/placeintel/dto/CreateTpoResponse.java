package com.rtx.placeintel.dto;


import com.rtx.placeintel.entity.enums.Role;

import java.util.UUID;

public record CreateTpoResponse(

        UUID id,

        String fullName,

        String email,

        Role role,

        boolean enabled

) {
}
