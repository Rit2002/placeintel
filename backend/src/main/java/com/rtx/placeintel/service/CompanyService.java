package com.rtx.placeintel.service;

import com.rtx.placeintel.dto.*;
import com.rtx.placeintel.entity.*;
import com.rtx.placeintel.entity.enums.CompanyType;
import com.rtx.placeintel.entity.enums.Role;
import com.rtx.placeintel.exception.DuplicateResourceException;
import com.rtx.placeintel.exception.ResourceNotFound;
import com.rtx.placeintel.repository.CompanyRepository;
import com.rtx.placeintel.repository.UserRepository;
import com.rtx.placeintel.service.spec.CompanySpecification;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CompanyService {




    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;
    private final StudentProfileService studentProfileService;


    // Register the company
    public ApiResponse<CompanyReference> createCompany(CompanyRequest req, Authentication auth) {

        if(companyRepository.existsByName(req.getName())) {

            throw new DuplicateResourceException("Company" + req.getName() + "already exists");
        }

        String email = auth.getName();

        User tpo = userRepository.findByEmail(email)
                .orElseThrow(() -> new IllegalStateException("Authenticated User not Found"));

        Company company = Company.builder()
                .name(req.getName())
                .logoUrl(req.getLogoUrl())
                .shortDescription(req.getShortDescription())
                .businessInfo(req.getBusinessInfo())
                .companyType(req.getCompanyType())
                .createdByTpo(tpo)
                .build();

        Company saved = companyRepository.save(company);

        CompanyReference companyResponse = new CompanyReference(
                saved.getId(),
                saved.getName(),
                saved.getLogoUrl(),
                saved.getShortDescription(),
                saved.getBusinessInfo(),
                saved.getCompanyType()
        );

        return  new ApiResponse<>(
                true,
                "Successfully created a company",
                companyResponse,
                null
        );
    }


    // delete the company
    public ApiResponse<Void> deleteCompany(UUID companyId) {

        if(!companyRepository.existsById(companyId)) {

            throw new ResourceNotFound("Company don't exists!");
        }

        companyRepository.deleteById(companyId);

        return new ApiResponse<>(
                true,
                "Successfully deleted the company.",
                null,
                null
        );
    }

    // Update the company
    public ApiResponse<Void> updateCompany(UUID companyId, CompanyRequest req) {


        Company company = companyRepository.findById(companyId)
                        .orElseThrow(() -> new ResourceNotFound("Company don't exists"));


        company.setName(req.getName());
        company.setLogoUrl(req.getLogoUrl());
        company.setShortDescription(req.getShortDescription());
        company.setBusinessInfo(req.getBusinessInfo());
        company.setCompanyType(req.getCompanyType());

        companyRepository.save(company);

        return new ApiResponse<>(
                true,
                "Successfully updated the company",
                null,
                null
        );

    }




    // Fetch the company details
    public ApiResponse<CompanyResponse> fetchCompanyById(UUID companyId, User requester) {

        if(requester.getRole() == Role.STUDENT) {

            studentProfileService.assertVerified(requester);
        }

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFound("Company don't exists"));

        List<DriveResponse> drives = company.getDrives()
                .stream()
                .map(this::mapToDrivesResponse)
                .toList();

        List<ResourceResponse> resources = company.getResources()
                .stream()
                .map(this::mapToResourceResponse)
                .toList();

        CompanyResponse response = new CompanyResponse(
                company.getId(),
                company.getName(),
                company.getLogoUrl(),
                company.getShortDescription(),
                company.getBusinessInfo(),
                company.getCompanyType(),
                drives,
                resources
        );

        return new ApiResponse<>(
                true,
                "Successfully fetched the company",
                response,
                null
        );
    }




    // Fetch ALL companies
    public ApiResponse<Page<CompanyResponse>> fetchAllCompanies(Pageable pageable) {

        Page<CompanyResponse> companies = companyRepository.findAll(pageable)
                .map(this::toCompanyResponse);

        return new ApiResponse<>(
                true,
                "Successfully fetched the company",
                companies,
                null
        );
    }




    public ApiResponse<Page<CompanyReference>> searchCompanies(
            String name,
            CompanyType companyType,
            Pageable pageable
    ) {
        Specification<Company> spec = CompanySpecification.build(name, companyType);

        Page<CompanyReference> results = companyRepository.findAll(spec, pageable)
                .map(this::toResponse);

        return new ApiResponse<>(
                true,
                "Company search completed",
                results,
                null
        );
    }


    // Helper Methods

    private CompanyResponse toCompanyResponse(Company company) {

         /*
            1) company.getDrives() :- Returns List<Drive>. List does not provide .map() directly.

            2) .stream() :- Converts List<Drive> into Stream<Drive>. Stream provides operations like map(), filter(), sorted(), etc.

            3).map(...) :- Transforms each element of the stream.
            Here: Drive → DriveResponse.
            Result: Stream<DriveResponse>.

            4).toList() :- Converts the resulting Stream<DriveResponse> back into List<DriveResponse>.
        */

        List<DriveResponse> driveResponses = company.getDrives()
                .stream()
                .map(this::mapToDrivesResponse)
                .toList();

        List<ResourceResponse> resourceResponses = company.getResources()
                .stream()
                .map(this::mapToResourceResponse)
                .toList();

        return new CompanyResponse(
                company.getId(),
                company.getName(),
                company.getLogoUrl(),
                company.getShortDescription(),
                company.getBusinessInfo(),
                company.getCompanyType(),
                driveResponses,
                resourceResponses
        );
    }

    private DriveResponse mapToDrivesResponse(Drive drive) {

        List<RoundResponse> rounds = drive.getRounds()
                .stream()
                .map(this::mapToRoundResponse)
                .toList();

        return new DriveResponse(
                drive.getId(),
                drive.getCompany().getId(),
                drive.getCompany().getName(),
                drive.getRoleOffered(),
                drive.getEmploymentType(),
                drive.getWorkMode(),
                drive.getCtcOffered(),
                drive.getStipend(),
                drive.getJobDescription(),
                drive.getRequiredSkills(),
                drive.getEligibleDepartments(),
                drive.getCutoffCgpa(),
                drive.getCutOffTenthPercentage(),
                drive.getCutOffTwelfthPercentage(),
                drive.getMaxAllowedBacklogs(),
                drive.getStatus(),
                drive.getDriveDate(),
                rounds
        );
    }

    private RoundResponse mapToRoundResponse(Round round) {

        return new RoundResponse(
                round.getId(),
                round.getRoundName(),
                round.getSequenceNumber(),
                round.getDescription(),
                round.getDurationMinutes(),
                round.getDifficulty()
        );
    }

    private ResourceResponse mapToResourceResponse(Resource resource) {

        return new ResourceResponse(
                resource.getId(),
                resource.getType(),
                resource.getTitle(),
                resource.getUrl(),
                resource.getCreatedAt()
        );
    }

    private CompanyReference toResponse(Company company) {

        return new CompanyReference(
                company.getId(),
                company.getName(),
                company.getLogoUrl(),
                company.getShortDescription(),
                company.getBusinessInfo(),
                company.getCompanyType()
        );
    }
}
