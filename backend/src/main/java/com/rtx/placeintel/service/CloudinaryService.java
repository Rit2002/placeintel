package com.rtx.placeintel.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.rtx.placeintel.exception.BusinessRuleException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class CloudinaryService {

    private final Cloudinary cloudinary;





    public Map uploadResume(
            MultipartFile file,
            String applicationId
    ) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new BusinessRuleException(
                    "Resume file is required"
            );
        }

        if (!"application/pdf".equalsIgnoreCase(
                file.getContentType()
        )) {
            throw new BusinessRuleException(
                    "Only PDF resumes are allowed"
            );
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BusinessRuleException(
                    "Resume size must not exceed 5 MB"
            );
        }

        Map<String, Object> options = new HashMap<>();

        options.put("resource_type", "raw");
        options.put("folder", "placeintel/resumes");
        options.put("public_id", applicationId + "_resume.pdf");
        options.put("overwrite", true);

        return cloudinary.uploader().upload(
                file.getBytes(),
                options
        );
    }





    public void deleteResume(String publicId)
            throws IOException {

        if (publicId == null || publicId.isBlank()) {
            return;
        }

        cloudinary.uploader().destroy(
                publicId,
                ObjectUtils.asMap(
                        "resource_type", "raw"
                )
        );
    }




    public Map uploadAchievementImage(
            MultipartFile file,
            String achievementId
    ) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new BusinessRuleException("Achievement image is required");
        }

        String contentType = file.getContentType();

        if (contentType == null ||
                !(contentType.equalsIgnoreCase("image/jpeg")
                        || contentType.equalsIgnoreCase("image/png")
                        || contentType.equalsIgnoreCase("image/webp"))) {
            throw new BusinessRuleException(
                    "Only JPG, PNG and WEBP achievement images are allowed"
            );
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new BusinessRuleException(
                    "Achievement image must not exceed 5 MB"
            );
        }

        Map<String, Object> options = new HashMap<>();

        options.put("resource_type", "image");
        options.put("folder", "placeintel/achievements");
        options.put("public_id", achievementId + "_image");
        options.put("overwrite", true);

        return cloudinary.uploader().upload(
                file.getBytes(),
                options
        );
    }





    public void deleteAchievementImage(String publicId) throws IOException {

        if (publicId == null || publicId.isBlank()) {

            throw new BusinessRuleException("publicId is required");
        }

        cloudinary.uploader().destroy(
                publicId,
                ObjectUtils.asMap("resource_type", "image")
        );
    }


}