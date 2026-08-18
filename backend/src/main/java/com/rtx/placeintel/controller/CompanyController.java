package com.rtx.placeintel.controller;

import com.rtx.placeintel.dto.ApiResponse;
import com.rtx.placeintel.dto.CompanyReference;
import com.rtx.placeintel.dto.CompanyRequest;
import com.rtx.placeintel.dto.CompanyResponse;
import com.rtx.placeintel.entity.Company;
import com.rtx.placeintel.entity.User;
import com.rtx.placeintel.entity.enums.CompanyType;
import com.rtx.placeintel.repository.UserRepository;
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
    private final UserRepository userRepository;



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
    @PreAuthorize("hasRole('STUDENT', 'TPO', 'ADMIN')")
    public ResponseEntity<ApiResponse<CompanyResponse>> getCompanyById(@PathVariable UUID id, Authentication authentication) {

        User user = currentUser(authentication);

        ApiResponse<CompanyResponse> response = companyService.fetchCompanyById(id, user);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }




    @GetMapping("/companies/all")
    public ResponseEntity<ApiResponse<Page<CompanyResponse>>> getAllCompanies(@PageableDefault(size = 10)Pageable pageable) {

        ApiResponse<Page<CompanyResponse>> response = companyService.fetchAllCompanies(pageable);

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }



    @GetMapping("/companies/search")
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




    // Helper method
    private User currentUser(Authentication auth) {

        String email = auth.getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated user not found" + email));
    }


}
