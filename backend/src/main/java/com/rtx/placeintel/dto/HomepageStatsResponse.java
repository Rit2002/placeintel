package com.rtx.placeintel.dto;

public record HomepageStatsResponse(
        long totalCompanies,
        long totalDrivesConducted,
        long totalStudentsPlaced,
        Double highestCtcOffered,
        long companiesCurrentlyHiring
) {}