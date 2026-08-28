package com.rtx.placeintel.controller;

import com.rtx.placeintel.dto.ApiResponse;
import com.rtx.placeintel.dto.DriveRequest;
import com.rtx.placeintel.dto.DriveResponse;
import com.rtx.placeintel.entity.User;
import com.rtx.placeintel.entity.enums.DriveStatus;
import com.rtx.placeintel.entity.enums.EmploymentType;
import com.rtx.placeintel.service.DriveService;
import com.rtx.placeintel.util.CurrentUserResolver;
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
public class DriveController {

    private final DriveService driveService;
    private final CurrentUserResolver currentUserResolver;




    //------ Reads ( Any Authenticated user) -----

    @GetMapping("/drive/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'TPO', 'ADMIN')")
    public ResponseEntity<ApiResponse<DriveResponse>> getDriveById(@PathVariable UUID id) {

        ApiResponse<DriveResponse> response = driveService.getDriveById(id);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }

    @GetMapping("/drives/search")
    public ResponseEntity<ApiResponse<Page<DriveResponse>>> searchDrives(
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) String department,
            @RequestParam(required = false) Double minCgpa,
            @RequestParam(required = false) Integer maxBacklogs,
            @RequestParam(required = false) EmploymentType employmentType,
            @RequestParam(required = false) DriveStatus status,
            @RequestParam(required = false) Integer minTenthPercentage,
            @RequestParam(required = false) Integer minTwelfthPercentage,
            @PageableDefault(size = 20, sort = "driveDate") Pageable pageable
    ) {



        ApiResponse<Page<DriveResponse>> response =  driveService.searchDrives(
                skill,
                department,
                minCgpa,
                minTenthPercentage,
                minTwelfthPercentage,
                maxBacklogs,
                employmentType,
                status,
                pageable
        );

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }


    // ----- TPO-only writes ------

    @PostMapping("/drive/{companyId}")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<ApiResponse<String>> createDrive(@PathVariable UUID companyId,
                                                           @Valid @RequestBody DriveRequest req,
                                                           Authentication authentication) {

        User tpo = currentUserResolver.resolve(authentication);

        ApiResponse<String> response = driveService.createDrive(companyId, req, tpo);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }




    @PutMapping("/drive/update/{id}")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<ApiResponse<String>> updateDrive(@PathVariable UUID id,
                                                           @Valid @RequestBody DriveRequest req) {

        ApiResponse<String> response = driveService.updateDrive(id, req);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }




    @DeleteMapping("/drive/delete/{id}")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<ApiResponse<String>> deleteDrive(@PathVariable UUID id) {

        ApiResponse<String> response = driveService.deleteDrive(id);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }


}
