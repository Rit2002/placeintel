package com.rtx.placeintel.controller;

import com.rtx.placeintel.dto.ApiResponse;
import com.rtx.placeintel.dto.BulkResourceRequest;
import com.rtx.placeintel.dto.ResourceRequest;
import com.rtx.placeintel.dto.ResourceResponse;
import com.rtx.placeintel.entity.User;
import com.rtx.placeintel.service.ResourceService;
import com.rtx.placeintel.util.CurrentUserResolver;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/placeintel/api/v1")
@RequiredArgsConstructor
public class ResourceController {



    private final ResourceService resourceService;
    private final CurrentUserResolver currentUserResolver;




    @GetMapping("/tpo/companies/{companyId}/resources")
    @PreAuthorize("hasAnyRole('STUDENT', 'TPO', 'ADMIN')")
    public ResponseEntity<ApiResponse<List<ResourceResponse>>> getCompanyResources(@PathVariable UUID companyId) {

        ApiResponse<List<ResourceResponse>> response = resourceService.getCompanyResources(companyId);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);

    }




    // ------- TPO-Only writes ---------
    // Create
    @PostMapping("/tpo/companies/{companyId}/resources")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<ApiResponse<ResourceResponse>> addResource(@PathVariable UUID companyId,
                                                        @Valid @RequestBody ResourceRequest req,
                                                        Authentication authentication) {
        User tpo = currentUserResolver.resolve(authentication);

        ApiResponse<ResourceResponse> response = resourceService.addResource(companyId, req, tpo);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }


    // Bulk resource create
    @PostMapping("/tpo/companies/{companyId}/resources/bulk")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<ApiResponse<List<ResourceResponse>>> addResourcesBulk(
            @PathVariable UUID companyId,
            @Valid @RequestBody BulkResourceRequest req,
            Authentication authentication) {


        User tpo = currentUserResolver.resolve(authentication);

        ApiResponse<List<ResourceResponse>> response =
                resourceService.addResourcesBulk(companyId, req.resources(), tpo);


        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }



    // Delete
    @DeleteMapping("/tpo/resources/{id}")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<ApiResponse<String>> deleteResource(@PathVariable UUID id) {

        ApiResponse<String> response = resourceService.deleteResource(id);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }


}