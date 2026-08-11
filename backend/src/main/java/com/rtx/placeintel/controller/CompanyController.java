package com.rtx.placeintel.controller;

import com.rtx.placeintel.dto.ApiResponse;
import com.rtx.placeintel.dto.CompanyRequest;
import com.rtx.placeintel.dto.CompanyResponse;
import com.rtx.placeintel.entity.Company;
import com.rtx.placeintel.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Pageable;
import java.util.UUID;

@RestController
@RequestMapping("/placeintel/api/v1")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @PostMapping("/company/register")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<ApiResponse<CompanyResponse>> createCompany(@Valid @RequestBody CompanyRequest req,
                                                         Authentication authentication) {


        ApiResponse<CompanyResponse> response = companyService.createCompany(req, authentication);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);

    }

    @DeleteMapping("/company/delete/{id}")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<ApiResponse<Void>> deleteCompany(@PathVariable UUID id) {

        ApiResponse<Void> response = companyService.deleteCompany(id);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }

    @PutMapping("/company/update/{id}")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<ApiResponse<Void>> updateCompany(@PathVariable UUID id, @Valid @RequestBody CompanyRequest req) {

        ApiResponse<Void> response = companyService.updateCompany(id, req);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);

    }



    @GetMapping("/company/{id}")
    public ResponseEntity<ApiResponse<Company>> getCompanyById(@PathVariable UUID id) {

        ApiResponse<Company> response = companyService.fetchCompanyById(id);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }

    @GetMapping("/company/all")
    public ResponseEntity<ApiResponse<Page<Company>>> getAllCompanies(@PageableDefault(size = 10)Pageable pageable) {

        ApiResponse<Page<Company>> response = companyService.fetchAllCompanies(pageable);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }


}
