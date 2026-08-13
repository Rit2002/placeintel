package com.rtx.placeintel.controller;

import com.rtx.placeintel.dto.ApiResponse;
import com.rtx.placeintel.dto.DriveRequest;
import com.rtx.placeintel.dto.DriveResponse;
import com.rtx.placeintel.entity.User;
import com.rtx.placeintel.repository.UserRepository;
import com.rtx.placeintel.service.DriveService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/placeintel/api/v1")
@RequiredArgsConstructor
public class DriveController {

    private final DriveService driveService;
    private final UserRepository userRepository;


    // ----- TPO-only writes ------

    @PostMapping("/drive/{companyId}")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<ApiResponse<String>> createDrive(@PathVariable UUID companyId,
                                                           @Valid @RequestBody DriveRequest req,
                                                           Authentication auth) {

        User tpo = currentUser(auth);

        ApiResponse<String> response = driveService.createDrive(companyId, req, tpo);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    private User currentUser(Authentication auth) {

        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found" + email));
    }

}
