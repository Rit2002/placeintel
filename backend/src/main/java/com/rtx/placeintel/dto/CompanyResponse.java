package com.rtx.placeintel.dto;

import com.rtx.placeintel.entity.enums.CompanyType;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.List;
import java.util.UUID;


public record CompanyResponse(
        UUID id,
        String name,
        String logoUrl,
        String shortDescription,
        String businessInfo,
        CompanyType companyType,
        List<DriveResponse> drives
//        List<ResourceResponse> resources
) {
}