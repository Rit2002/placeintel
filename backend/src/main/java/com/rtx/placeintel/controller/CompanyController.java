package com.rtx.placeintel.controller;

import com.rtx.placeintel.dto.ApiResponse;
import com.rtx.placeintel.dto.CompanyReference;
import com.rtx.placeintel.dto.CompanyRequest;
import com.rtx.placeintel.dto.CompanyResponse;
import com.rtx.placeintel.entity.User;
import com.rtx.placeintel.entity.enums.CompanyType;
import com.rtx.placeintel.service.CompanyService;
import com.rtx.placeintel.util.CurrentUserResolver;
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


import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/placeintel/api/v1")
@RequiredArgsConstructor
public class CompanyController {




    private final CompanyService companyService;
    private final CurrentUserResolver currentUserResolver;



    // -------- Write - Only endpoint ---------
    @PostMapping("/company/register")
    @PreAuthorize("hasRole('TPO')")
    public ResponseEntity<ApiResponse<CompanyReference>> createCompany(@Valid @RequestBody CompanyRequest req,
                                                                       Authentication authentication) {


        ApiResponse<CompanyReference> response = companyService.createCompany(req, authentication);

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




    // --------- Read - Only access ------------
    @GetMapping("/company/{id}")
    @PreAuthorize("hasAnyRole('STUDENT', 'TPO', 'ADMIN')")
    public ResponseEntity<ApiResponse<CompanyResponse>> getCompanyById(@PathVariable UUID id, Authentication authentication) {

        User user = currentUserResolver.resolve(authentication);

        ApiResponse<CompanyResponse> response = companyService.fetchCompanyById(id, user);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }




    @GetMapping("/company/all")
    public ResponseEntity<ApiResponse<Page<CompanyResponse>>> getAllCompanies(
            /*
            * Pageable is a special type Spring automatically constructs by reading page, size, and sort query parameters
            * off the incoming request URL, via a built-in resolver — you don't declare @RequestParam int page yourself,
            * Spring handles it invisibly.
            * */
            @PageableDefault(size = 10)Pageable pageable
    ) {

        ApiResponse<Page<CompanyResponse>> response = companyService.fetchAllCompanies(pageable);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }



    @GetMapping("/company/search")
    public ResponseEntity<ApiResponse<Page<CompanyReference>>> searchCompanies(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) CompanyType companyType,
            @PageableDefault(size = 20, sort = "name") Pageable pageable
    ) {



        ApiResponse<Page<CompanyReference>> response =
                companyService.searchCompanies(name, companyType, pageable);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);

    }




    @GetMapping("/company/eligible-search")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<ApiResponse<Page<CompanyReference>>> searchEligibleCompanies(
            @RequestParam(required = false) Double cgpa,
            @RequestParam(required = false) Integer tenth,
            @RequestParam(required = false) Integer twelfth,
            @RequestParam(required = false) Integer backlogs,
            @RequestParam(required = false) List<String> skills,
            @RequestParam(required = false) CompanyType companyType,
            @PageableDefault(size = 20, sort = "name") Pageable pageable
    ) {
        ApiResponse<Page<CompanyReference>> response =
                companyService.searchEligibleCompanies(cgpa, tenth, twelfth, backlogs, skills, companyType, pageable);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }



}
