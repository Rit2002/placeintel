package com.rtx.placeintel.dto;

import com.rtx.placeintel.entity.enums.VerificationStatus;

import java.util.List;
import java.util.UUID;

public record StudentProfileResponse(
        UUID id,
        String fullName,
        String enrollmentNo,
        String department,
        Double cgpa,
        Double tenthPercentage,
        Double twelfthPercentage,
        Integer activeBacklogs,
        List<String> skills,
        String linkedinUrl,
        String githubUsername,
        String resumeUrl,
        boolean profileCompleted,
        VerificationStatus verificationStatus,
        String verificationNote
) {}