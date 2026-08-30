package com.rtx.placeintel.controller;

import com.rtx.placeintel.dto.ApiResponse;
import com.rtx.placeintel.dto.CompanyResearchApiRequest;
import com.rtx.placeintel.dto.CompanyResearchApiResponse;
import com.rtx.placeintel.service.CompanyResearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/placeintel/api/v1")
@RequiredArgsConstructor
public class CompanyResearchController {

    private final CompanyResearchService companyResearchService;

    @PostMapping("/tpo/companies/research")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<ApiResponse<CompanyResearchApiResponse>> research(
            @RequestBody CompanyResearchApiRequest req) {


        ApiResponse<CompanyResearchApiResponse> response =
                companyResearchService.research(req.companyName(), req.role());

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }
}
