package com.rtx.placeintel.dto;

import com.rtx.placeintel.entity.enums.CompanyType;

import java.util.UUID;

public record CompanyReference(
        UUID id,
        String name,
        String logoUrl,
        String shortDescription,
        String businessInfo,
        CompanyType companyType
) {
}
