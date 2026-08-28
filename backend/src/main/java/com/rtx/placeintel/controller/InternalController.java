package com.rtx.placeintel.controller;

import com.rtx.placeintel.dto.ApiResponse;
import com.rtx.placeintel.dto.DriveResponse;
import com.rtx.placeintel.dto.StudentProfileResponse;
import com.rtx.placeintel.service.DriveService;
import com.rtx.placeintel.service.StudentProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.UUID;

@RestController
@RequestMapping("/placeintel/api/v1/internal")
@RequiredArgsConstructor
public class InternalController {




    private final DriveService driveService;
    private final StudentProfileService studentProfileService;




    @Value("${internal.api-key}")
    private String internalApiKey;




    @GetMapping("/students/{studentProfileId}")
    public ResponseEntity<ApiResponse<StudentProfileResponse>> getStudentProfile(

            @PathVariable UUID studentProfileId,

            @RequestHeader("X-Internal-Api-Key") String providedKey

    ) {

        validateKey(providedKey);

       ApiResponse<StudentProfileResponse> response =
               studentProfileService.getProfileById(studentProfileId);

       return ResponseEntity
               .status(HttpStatus.OK)
               .body(response);
    }




    @GetMapping("/companies/{companyId}/most-relevant-drive")
    public ResponseEntity<ApiResponse<DriveResponse>> getMostRelevantDrive(
            @PathVariable UUID companyId,
            @RequestHeader("X-Internal-Api-Key") String providedKey) {

        validateKey(providedKey);

       ApiResponse<DriveResponse> response =  driveService.getMostRelevantDrive(companyId);

       return ResponseEntity
               .status(HttpStatus.OK)
               .body(response);
    }



    // Helper Methods
    private void validateKey(String providedKey) {

        if (!internalApiKey.equals(providedKey)) {

            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Invalid internal API key");
        }
    }
}