package com.rtx.placeintel.controller;

import com.rtx.placeintel.dto.ApiResponse;
import com.rtx.placeintel.dto.ApplicationResponse;
import com.rtx.placeintel.entity.User;
import com.rtx.placeintel.repository.UserRepository;
import com.rtx.placeintel.service.ApplicationService;
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
@RequestMapping("/placeintel/api/v1/students/me/applications")
@RequiredArgsConstructor
public class ApplicationController {




    private final ApplicationService applicationService;

    private final UserRepository userRepository;




    @PostMapping("/{driveId}")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<ApplicationResponse>> apply( @PathVariable UUID driveId,
                                                                   Authentication authentication) {

        User student = currentUser(authentication);

        ApiResponse<ApplicationResponse> response = applicationService.apply(student, driveId);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }




    @GetMapping
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Page<ApplicationResponse>>> getMyApplications(
            Authentication authentication,
            @PageableDefault(size = 20, sort = "appliedAt") Pageable pageable) {

        User student = currentUser(authentication);

        ApiResponse<Page<ApplicationResponse>> response =
                applicationService.getMyApplications(student, pageable);

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