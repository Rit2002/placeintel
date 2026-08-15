package com.rtx.placeintel.dto;


import java.util.UUID;

public record CreateTpoResponse(

        UUID id,

        String email,

        boolean enabled

) {
}
