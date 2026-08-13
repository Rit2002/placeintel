package com.rtx.placeintel.dto;

import com.rtx.placeintel.entity.enums.DriveStatus;
import com.rtx.placeintel.entity.enums.EmploymentType;
import com.rtx.placeintel.entity.enums.WorkMode;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public record DriveResponse(
        UUID id,
        UUID companyId,
        String companyName,
        String roleOffered,
        EmploymentType employmentType,
        WorkMode workMode,
        Double ctcOffered,
        Double stipend,
        String jobDescription,
        List<String> requiredSkills,
        List<String> eligibleDepartments,
        Double cutOffCgpa,
        Integer cutOffTenthPercentage,
        Integer cutOffTwelfthPercentage,
        Integer maxAllowedBacklogs,
        DriveStatus status,
        LocalDate driveDate,
        List<RoundResponse> rounds
) {
}
