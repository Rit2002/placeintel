package com.rtx.placeintel.service;

import com.rtx.placeintel.dto.ApiResponse;
import com.rtx.placeintel.dto.CompleteProfileRequest;
import com.rtx.placeintel.dto.StudentProfileResponse;
import com.rtx.placeintel.dto.VerifyStudentRequest;
import com.rtx.placeintel.entity.StudentProfile;
import com.rtx.placeintel.entity.User;
import com.rtx.placeintel.entity.enums.VerificationStatus;
import com.rtx.placeintel.exception.ResourceNotFound;
import com.rtx.placeintel.repository.ApplicationRepository;
import com.rtx.placeintel.repository.StudentProfileRepository;
import com.rtx.placeintel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentProfileService {



    private final StudentProfileRepository studentProfileRepository;
    private final ApplicationRepository applicationRepository;
    private final UserRepository userRepository;




    @Transactional
    public ApiResponse<StudentProfileResponse> completeProfile(User student, CompleteProfileRequest req) {


        StudentProfile profile = studentProfileRepository.findByUserId(student.getId())
                .orElseThrow(() -> new ResourceNotFound("Student profile not found"));

        profile.setDepartment(normalize(req.department()));
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



    @Transactional
    public ApiResponse<StudentProfileResponse> verifyStudent(UUID studentProfileId, VerifyStudentRequest req) {


        StudentProfile profile = studentProfileRepository.findById(studentProfileId)
                .orElseThrow(() -> new ResourceNotFound("Student profile not found: " + studentProfileId));

        profile.setVerificationStatus(req.status());
        profile.setVerificationNote(req.note());

        studentProfileRepository.save(profile);

        String message = req.status() == VerificationStatus.VERIFIED
                ? "Student verified successfully"
                : "Student verification rejected";

        return new ApiResponse<>(
                true,
                message,
                null,
                null
        );
    }





    public ApiResponse<Page<StudentProfileResponse>> getPendingVerifications(Pageable pageable) {

        Page<StudentProfileResponse> pending = studentProfileRepository
                .findByVerificationStatus(VerificationStatus.PENDING, pageable)
                .map(this::toResponse);

        return new ApiResponse<>(
                true,
                "Pending verifications fetched",
                pending,
                null
        );
    }


    public ApiResponse<StudentProfileResponse> getProfileById(UUID studentProfileId) {

        StudentProfile profile = studentProfileRepository.findById(studentProfileId)
                .orElseThrow(() -> new ResourceNotFound("Student profile NOT found"));

        StudentProfileResponse parsedResponse = toResponse(profile);

        return new ApiResponse<>(
                true,
                "Successfully fetched the student profile",
                parsedResponse,
                null
        );
    }









    public ApiResponse<Page<StudentProfileResponse>> getAllStudents(Pageable pageable) {

        Page<StudentProfile> profile = studentProfileRepository.findAll(pageable);

        Page<StudentProfileResponse> response = profile
                .map(this::toResponse);

        return new ApiResponse<>(
                true,
                "successfully fetched Students",
                response,
                null
        );
    }







    @Transactional
    public ApiResponse<Void> deleteStudent(UUID studentId) {

        StudentProfile profile = studentProfileRepository
                .findById(studentId)
                .orElseThrow(() ->
                        new UsernameNotFoundException("Student profile not found")
                );

        User user = profile.getUser();

        // Delete the applications first because they reference StudentProfile.
        applicationRepository.deleteByStudentProfile(profile);

        //Delete Student profile
        studentProfileRepository.delete(profile);

        //Delete the associated User
        userRepository.delete(user);

        return new ApiResponse<>(
                true,
                "Student deleted successfully",
                null,
                null
        );
    }









    // Helper Methods
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


    public void assertVerified(User student) {

        StudentProfile profile = studentProfileRepository.findByUserId(student.getId())
                .orElseThrow(() -> new ResourceNotFound("Student profile not found"));


        if (profile.getVerificationStatus() != VerificationStatus.VERIFIED) {
            throw new AccessDeniedException(
                    "Your profile must be verified by TPO before accessing this feature");
        }
    }

    private String normalize(String value) {
        return value == null ? null : value.trim().toUpperCase();
    }


}