package com.rtx.placeintel.controller;

import com.rtx.placeintel.dto.*;
import com.rtx.placeintel.service.PlacementAchievementService;
import jakarta.validation.constraints.NotNull;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/placeintel/api/v1")
@RequiredArgsConstructor
public class PlacementAchievementController {


    private final PlacementAchievementService achievementService;


//------------------- Student Achievement Section -------------------------

    @GetMapping("/achievements")
    public ResponseEntity<ApiResponse<List<PlacementAchievementResponse>>> getPublicAchievements() {

        ApiResponse<List<PlacementAchievementResponse>> response =
                achievementService.getPublicAchievements();

        return ResponseEntity.ok(response);
    }








    /**
     * TPO-only write endpoint. Multipart fields:
     * studentProfileId, ctcOffered, image(optional)
     */
    @PostMapping(
            value = "/tpo/achievements",
            consumes = "multipart/form-data"
    )
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<ApiResponse<PlacementAchievementResponse>> createAchievement(
            @RequestPart("studentProfileId") @NotNull UUID studentProfileId,
            @RequestPart("companyName") @NotNull String companyName,
            @RequestPart("ctcOffered") @NotNull Double ctcOffered,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) throws IOException {

        ApiResponse<PlacementAchievementResponse> response =
                achievementService.createAchievement(
                        studentProfileId,
                        companyName,
                        ctcOffered,
                        image
                );

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }








    @DeleteMapping("/tpo/achievements/{id}")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<ApiResponse<Void>> deleteAchievement(
            @PathVariable UUID id
    ) throws IOException {

        ApiResponse<Void> response = achievementService.deleteAchievement(id);

        return ResponseEntity.ok(response);
    }


}