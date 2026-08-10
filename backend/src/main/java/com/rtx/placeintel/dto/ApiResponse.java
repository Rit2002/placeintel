package com.rtx.placeintel.dto;

public record ApiResponse<T>(
        boolean success,
        String message,
        T data,
        String error
) {}
