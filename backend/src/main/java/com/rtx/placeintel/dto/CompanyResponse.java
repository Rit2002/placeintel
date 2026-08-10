package com.rtx.placeintel.dto;

import com.rtx.placeintel.entity.enums.CompanyType;
import lombok.AllArgsConstructor;
import lombok.Getter;

import java.util.UUID;

@Getter
@AllArgsConstructor
public class CompanyResponse {
    private String name;
    private UUID id;
}