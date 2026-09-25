package com.rtx.placeintel.service;

import com.rtx.placeintel.dto.ApiResponse;
import com.rtx.placeintel.dto.PlacementAchievementResponse;
import com.rtx.placeintel.entity.PlacementAchievement;
import com.rtx.placeintel.entity.StudentProfile;
import com.rtx.placeintel.entity.enums.VerificationStatus;
import com.rtx.placeintel.exception.BusinessRuleException;
import com.rtx.placeintel.exception.ResourceNotFound;
import com.rtx.placeintel.repository.PlacementAchievementRepository;
import com.rtx.placeintel.repository.StudentProfileRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PlacementAchievementService {


    private final PlacementAchievementRepository achievementRepository;

    private final StudentProfileRepository studentProfileRepository;

    private final CloudinaryService cloudinaryService;


    @Transactional
    public ApiResponse<PlacementAchievementResponse> createAchievement(
            UUID studentProfileId,
            String companyName,
            Double ctcOffered,
            MultipartFile image
    ) throws IOException {


        // ---------------------------------------------------------
        // Validate company name
        // ---------------------------------------------------------

        if (companyName == null || companyName.isBlank()) {

            throw new BusinessRuleException(
                    "Company name is required"
            );
        }


        // ---------------------------------------------------------
        // Validate CTC
        // ---------------------------------------------------------

        if (ctcOffered == null || ctcOffered <= 0) {

            throw new BusinessRuleException(
                    "CTC must be greater than 0"
            );
        }


        // ---------------------------------------------------------
        // Find student
        // ---------------------------------------------------------

        StudentProfile profile =
                studentProfileRepository
                        .findById(studentProfileId)
                        .orElseThrow(() ->
                                new ResourceNotFound(
                                        "Student profile not found: "
                                                + studentProfileId
                                )
                        );


        // ---------------------------------------------------------
        // Only verified students
        // ---------------------------------------------------------

        if (
                profile.getVerificationStatus()
                        != VerificationStatus.VERIFIED
        ) {

            throw new BusinessRuleException(
                    "Only verified students can be added as placement achievements"
            );
        }


        // ---------------------------------------------------------
        // Create achievement
        // ---------------------------------------------------------

        PlacementAchievement achievement =
                PlacementAchievement.builder()
                        .studentProfile(profile)
                        .companyName(companyName.trim())
                        .ctcOffered(ctcOffered)
                        .build();


        PlacementAchievement saved =
                achievementRepository.save(achievement);


        // ---------------------------------------------------------
        // Upload image if provided
        // ---------------------------------------------------------

        try {

            if (image != null && !image.isEmpty()) {

                Map<String, Object> uploadResult =
                        cloudinaryService.uploadAchievementImage(
                                image,
                                saved.getId().toString()
                        );


                saved.setImageUrl(
                        uploadResult
                                .get("secure_url")
                                .toString()
                );


                saved.setImagePublicId(
                        uploadResult
                                .get("public_id")
                                .toString()
                );


                saved =
                        achievementRepository.save(saved);
            }

        } catch (IOException | RuntimeException ex) {


            // Best-effort cleanup if Cloudinary succeeded
            // but persistence/update failed.

            if (saved.getImagePublicId() != null) {

                try {

                    cloudinaryService.deleteAchievementImage(
                            saved.getImagePublicId()
                    );

                } catch (IOException ignored) {

                    // Keep original exception.
                }
            }


            throw ex;
        }


        return new ApiResponse<>(
                true,
                "Placement achievement added successfully",
                toResponse(saved),
                null
        );
    }







    @Transactional(readOnly = true)
    public ApiResponse<
            List<PlacementAchievementResponse>
            > getPublicAchievements() {


        List<PlacementAchievementResponse> achievements =
                achievementRepository
                        .findAllByOrderByCreatedAtDesc()
                        .stream()
                        .map(this::toResponse)
                        .toList();


        return new ApiResponse<>(
                true,
                "Placement achievements fetched successfully",
                achievements,
                null
        );
    }







    @Transactional
    public ApiResponse<Void> deleteAchievement(
            UUID achievementId
    )  {


        PlacementAchievement achievement =
                achievementRepository
                        .findById(achievementId)
                        .orElseThrow(() ->
                                new ResourceNotFound(
                                        "Placement achievement not found: "
                                                + achievementId
                                )
                        );


        if (achievement.getImagePublicId() != null) {

            try {

                cloudinaryService.deleteAchievementImage(
                        achievement.getImagePublicId()
                );

            } catch (IOException ex) {

                // Do not keep DB record merely because
                // Cloudinary cleanup failed.
            }
        }


        achievementRepository.delete(achievement);


        return new ApiResponse<>(
                true,
                "Placement achievement deleted successfully",
                null,
                null
        );
    }






    private PlacementAchievementResponse toResponse(
            PlacementAchievement achievement
    ) {

        StudentProfile profile =
                achievement.getStudentProfile();


        return new PlacementAchievementResponse(
                achievement.getId(),
                profile.getId(),
                profile.getFullName(),
                profile.getDepartment(),
                achievement.getCompanyName(),
                achievement.getCtcOffered(),
                achievement.getImageUrl(),
                achievement.getCreatedAt()
        );
    }
}