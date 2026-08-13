package com.rtx.placeintel.service;

import com.rtx.placeintel.dto.*;
import com.rtx.placeintel.entity.Company;
import com.rtx.placeintel.entity.Drive;
import com.rtx.placeintel.entity.Round;
import com.rtx.placeintel.entity.User;
import com.rtx.placeintel.exception.DuplicateResourceException;
import com.rtx.placeintel.exception.ResourceNotFound;
import com.rtx.placeintel.repository.CompanyRepository;
import com.rtx.placeintel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CompanyService {




    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;


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
                saved.getName()
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
    public ApiResponse<CompanyResponse> fetchCompanyById(UUID companyId) {

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFound("Company don't exists"));

        List<DriveResponse> drives = company.getDrives()
                .stream()
                .map(this::mapToDrivesResponse)
                .toList();

//        List<ResourceResponse> resources = company.getResources()
//                .stream()
//                .map(this::mapToResourceResponse)
//                .toList();

        CompanyResponse response = new CompanyResponse(
                company.getId(),
                company.getName(),
                company.getLogoUrl(),
                company.getShortDescription(),
                company.getBusinessInfo(),
                company.getCompanyType(),
                drives
//                resources
        );

        return new ApiResponse<>(
                true,
                "Successfully fetched the company",
                response,
                null
        );
    }





    // Fetch ALL companies
    public ApiResponse<Page<Company>> fetchAllCompanies(Pageable pageable) {

        Page<Company> companies = companyRepository.findAll(pageable);

        return new ApiResponse<>(
                true,
                "Successfully fetched the company",
                companies,
                null
        );
    }




    // Helper Methods

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
}
