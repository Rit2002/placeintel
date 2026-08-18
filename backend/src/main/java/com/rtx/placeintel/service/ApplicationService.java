package com.rtx.placeintel.service;

import com.rtx.placeintel.dto.ApiResponse;
import com.rtx.placeintel.dto.ApplicationResponse;
import com.rtx.placeintel.entity.*;
import com.rtx.placeintel.entity.enums.VerificationStatus;
import com.rtx.placeintel.exception.DuplicateResourceException;
import com.rtx.placeintel.exception.ResourceNotFound;
import com.rtx.placeintel.repository.ApplicationRepository;
import com.rtx.placeintel.repository.DriveRepository;
import com.rtx.placeintel.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ApplicationService {



    private final ApplicationRepository applicationRepository;
    private final StudentProfileRepository studentProfileRepository;
    private final DriveRepository driveRepository;




    @Transactional
    public ApiResponse<ApplicationResponse> apply(User student, UUID driveId) {

        StudentProfile profile = studentProfileRepository.findByUserId(student.getId())
                .orElseThrow(() -> new ResourceNotFound("Student profile not found"));

        if (profile.getVerificationStatus() != VerificationStatus.VERIFIED) {
            throw new AccessDeniedException("Your profile must be verified before applying to drives");
        }

        if (!profile.isProfileCompleted()) {
            throw new AccessDeniedException("Please complete your profile before applying");
        }

        Drive drive = driveRepository.findById(driveId)
                .orElseThrow(() -> new ResourceNotFound("Drive not found: " + driveId));

        if (applicationRepository.existsByStudentProfileIdAndDriveId(profile.getId(), driveId)) {
            throw new DuplicateResourceException("You have already applied to this drive");
        }

        List<String> failedReasons = checkEligibility(profile, drive);
        if (!failedReasons.isEmpty()) {
            throw new AccessDeniedException(
                    "You do not meet this drive's eligibility criteria: " + String.join("; ", failedReasons));
        }

        Application application = Application.builder()
                .studentProfile(profile)
                .drive(drive)
                .build();


        Application saved = applicationRepository.save(application);


        return new ApiResponse<>(
                true,
                "Application submitted successfully",
                toResponse(saved),
                null
        );
    }





    public ApiResponse<Page<ApplicationResponse>> getMyApplications(User student, Pageable pageable) {

        StudentProfile profile = studentProfileRepository.findByUserId(student.getId())
                .orElseThrow(() -> new ResourceNotFound("Student profile not found"));

        Page<ApplicationResponse> applications = applicationRepository
                .findByStudentProfileId(profile.getId(), pageable)
                .map(this::toResponse);

        return new ApiResponse<>(
                true,
                "Applications fetched",
                applications,
                null
        );
    }




    // Helper Method
    public ApplicationResponse toResponse(Application app) {
        return new ApplicationResponse(
                app.getId(),
                app.getDrive().getId(),
                app.getDrive().getRoleOffered(),
                app.getDrive().getCompany().getName(),
                app.getStatus(),
                app.getAppliedAt()
        );
    }


    private List<String> checkEligibility(StudentProfile profile, Drive drive) {
        List<String> reasons = new ArrayList<>();

        if (drive.getCutoffCgpa() != null) {
            if (profile.getCgpa() == null || profile.getCgpa() < drive.getCutoffCgpa()) {
                reasons.add("CGPA below required " + drive.getCutoffCgpa());
            }
        }

        if (drive.getCutOffTenthPercentage() != null) {
            if (profile.getTenthPercentage() == null || profile.getTenthPercentage() < drive.getCutOffTenthPercentage()) {
                reasons.add("10th percentage below required " + drive.getCutOffTenthPercentage() + "%");
            }
        }

        if (drive.getCutOffTwelfthPercentage() != null) {
            if (profile.getTwelfthPercentage() == null || profile.getTwelfthPercentage() < drive.getCutOffTwelfthPercentage()) {
                reasons.add("12th percentage below required " + drive.getCutOffTwelfthPercentage() + "%");
            }
        }

        if (profile.getActiveBacklog() > drive.getMaxAllowedBacklogs()) {
            reasons.add("active backlogs exceed allowed limit of " + drive.getMaxAllowedBacklogs());
        }

        if (!drive.getEligibleDepartments().isEmpty()
                && !drive.getEligibleDepartments().contains(profile.getDepartment())) {
            reasons.add("department not eligible for this drive");
        }

        return reasons;
    }
}