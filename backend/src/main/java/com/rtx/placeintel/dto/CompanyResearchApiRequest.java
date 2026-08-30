package com.rtx.placeintel.dto;

import com.fasterxml.jackson.annotation.JsonProperty;

/*@JsonProperty is a Jackson annotation in Java used to control how a Java field, getter, setter, or constructor parameter maps to a JSON property.*/

public record CompanyResearchApiRequest(
        @JsonProperty("company_name") String companyName,
        String role
) {}