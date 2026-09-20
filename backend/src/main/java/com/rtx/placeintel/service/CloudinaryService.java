package com.rtx.placeintel.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
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
            throw new IllegalArgumentException(
                    "Resume file is required"
            );
        }

        if (!"application/pdf".equalsIgnoreCase(
                file.getContentType()
        )) {
            throw new IllegalArgumentException(
                    "Only PDF resumes are allowed"
            );
        }

        if (file.getSize() > 5 * 1024 * 1024) {
            throw new IllegalArgumentException(
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
}