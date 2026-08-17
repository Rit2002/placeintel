package com.rtx.placeintel.service;

import com.rtx.placeintel.dto.ApiResponse;
import com.rtx.placeintel.dto.CompleteProfileRequest;
import com.rtx.placeintel.dto.StudentProfileResponse;
import com.rtx.placeintel.entity.StudentProfile;
import com.rtx.placeintel.entity.User;
import com.rtx.placeintel.exception.ResourceNotFound;
import com.rtx.placeintel.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;

@Service
@RequiredArgsConstructor
public class StudentProfileService {



    private final StudentProfileRepository studentProfileRepository;




    @Transactional
    public ApiResponse<StudentProfileResponse> completeProfile(User student, CompleteProfileRequest req) {


        StudentProfile profile = studentProfileRepository.findByUserId(student.getId())
                .orElseThrow(() -> new ResourceNotFound("Student profile not found"));


        profile.setDepartment(req.department());
        profile.setCgpa(req.cgpa());
        profile.setTenthPercentage(req.tenthPercentage());
        profile.setTwelfthPercentage(req.twelfthPercentage());
        profile.setActiveBacklog(req.activeBacklogs());
        profile.setSkills(req.skills() != null ? req.skills() : new ArrayList<>());
        profile.setLinkedinUrl(req.linkedinUrl());
        profile.setGithubUsername(req.githubUsername());
        profile.setResumeUrl(req.resumeUrl());
        profile.setProfileCompleted(true);

        StudentProfile saved = studentProfileRepository.save(profile);

        return new ApiResponse<>(
                true,
                "Profile completed successfully",
                toResponse(saved),
                null
        );
    }




    public ApiResponse<StudentProfileResponse> getMyProfile(User student) {

        StudentProfile profile = studentProfileRepository.findByUserId(student.getId())
                .orElseThrow(() -> new ResourceNotFound("Student profile not found"));

        return new ApiResponse<>(
                true,
                "Successfully Profile fetched",
                toResponse(profile),
                null
        );
    }




    private StudentProfileResponse toResponse(StudentProfile p) {

        return new StudentProfileResponse(

                p.getId(), p.getFullName(),

                p.getEnrollmentNo(), p.getDepartment(),

                p.getCgpa(), p.getTenthPercentage(),

                p.getTwelfthPercentage(), p.getActiveBacklog(),

                p.getSkills(), p.getLinkedinUrl(),

                p.getGithubUsername(), p.getResumeUrl(),

                p.isProfileCompleted(), p.getVerificationStatus(),

                p.getVerificationNote()
        );
    }
}