package com.rtx.placeintel.dto;

import com.rtx.placeintel.entity.enums.CompanyType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CompanyRequest {

    @NotBlank
    private String name;

    private String logoUrl;

    @NotNull(message = "Invalid company type")
    private CompanyType companyType;

    @Size(min = 10, max = 1000, message = "Description is not of required length")
    private String shortDescription;

    @Size(min = 10, max = 1000, message = "Description is not of required length")
    private String businessInfo;

}
