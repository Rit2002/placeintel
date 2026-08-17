package com.rtx.placeintel.controller;

import com.rtx.placeintel.dto.ApiResponse;
import com.rtx.placeintel.dto.CompleteProfileRequest;
import com.rtx.placeintel.dto.StudentProfileResponse;
import com.rtx.placeintel.dto.VerifyStudentRequest;
import com.rtx.placeintel.entity.User;
import com.rtx.placeintel.repository.UserRepository;
import com.rtx.placeintel.service.StudentProfileService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/placeintel/api/v1")
@RequiredArgsConstructor
public class StudentProfileController {




    private final StudentProfileService studentProfileService;

    private final UserRepository userRepository;




    @GetMapping("/students/me/profile")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> getMyProfile(Authentication authentication) {


        User student = currentUser(authentication);


        ApiResponse<StudentProfileResponse> response = studentProfileService.getMyProfile(student);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }




    @PutMapping("/students/me/profile")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> completeProfile(
            @Valid @RequestBody CompleteProfileRequest req,
            Authentication authentication) {


        User student = currentUser(authentication);

        ApiResponse<StudentProfileResponse> response = studentProfileService.completeProfile(student, req);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }




    @PatchMapping("/students/{studentProfileId}/verify")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> verifyStudent(
            @PathVariable UUID studentProfileId,
            @Valid @RequestBody VerifyStudentRequest req) {


        ApiResponse<StudentProfileResponse> response = studentProfileService.verifyStudent(studentProfileId, req);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }




    @GetMapping("/tpo/students/pending")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<ApiResponse<Page<StudentProfileResponse>>> getPendingVerifications(
            @PageableDefault(size = 20, sort = "createdAt") Pageable pageable) {



        ApiResponse<Page<StudentProfileResponse>> response = studentProfileService.getPendingVerifications(pageable);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }



    // Helper Method
    private User currentUser(Authentication authentication) {

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found"));
    }
}