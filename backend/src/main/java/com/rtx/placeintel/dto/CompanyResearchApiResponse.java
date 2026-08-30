package com.rtx.placeintel.dto;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.rtx.placeintel.entity.enums.CompanyType;

import java.util.List;

public record CompanyResearchApiResponse(
        @JsonProperty("business_info") String businessInfo,
        @JsonProperty("company_type") CompanyType companyType,
        @JsonProperty("careers_page_url") String careersPageUrl,
        List<ResearchedResource> resources
) {}
