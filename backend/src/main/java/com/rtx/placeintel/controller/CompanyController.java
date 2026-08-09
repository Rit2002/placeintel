package com.rtx.placeintel.controller;

import com.rtx.placeintel.dto.CompanyRequest;
import com.rtx.placeintel.dto.CompanyResponse;
import com.rtx.placeintel.service.CompanyService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/placeintel/api/v1")
@RequiredArgsConstructor
public class CompanyController {

    private final CompanyService companyService;

    @PostMapping("/company")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<CompanyResponse> createCompany(@Valid @RequestBody CompanyRequest req,
                                                         Authentication authentication) {


        CompanyResponse response = companyService.createCompany(req, authentication);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);

    }

}
