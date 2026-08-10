package com.rtx.placeintel.controller;

import com.rtx.placeintel.dto.ApiResponse;
import com.rtx.placeintel.dto.CompanyRequest;
import com.rtx.placeintel.dto.CompanyResponse;
import com.rtx.placeintel.service.CompanyService;
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
public class CompanyController {

    private final CompanyService companyService;

    @PostMapping("/company")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<ApiResponse> createCompany(@Valid @RequestBody CompanyRequest req,
                                                         Authentication authentication) {


        ApiResponse response = companyService.createCompany(req, authentication);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);

    }

    @DeleteMapping("/company/delete/{id}")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<String> deleteCompany(@PathVariable UUID id) {

        String response = companyService.deleteCompany(id);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }

    @PutMapping("/company/update/{id}")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<ApiResponse> updateCompany(@PathVariable UUID id, @Valid @RequestBody CompanyRequest req) {

        ApiResponse response = companyService.updateCompany(id, req);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);

    }


}
