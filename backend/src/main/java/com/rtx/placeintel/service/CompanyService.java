package com.rtx.placeintel.service;

import com.rtx.placeintel.dto.ApiResponse;
import com.rtx.placeintel.dto.CompanyRequest;
import com.rtx.placeintel.dto.CompanyResponse;
import com.rtx.placeintel.entity.Company;
import com.rtx.placeintel.entity.User;
import com.rtx.placeintel.exception.DuplicateResourceException;
import com.rtx.placeintel.exception.ResourceNotFound;
import com.rtx.placeintel.repository.CompanyRepository;
import com.rtx.placeintel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.Objects;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CompanyService {




    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;



    public ApiResponse createCompany(CompanyRequest req, Authentication auth) {

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

        CompanyResponse companyResponse = new CompanyResponse(
                saved.getName(),
                saved.getId()
        );

        return  new ApiResponse(
                true,
                "Successfully created a company",
                companyResponse,
                null
        );
    }



    public String deleteCompany(UUID companyId) {

        if(!companyRepository.existsById(companyId)) {

            throw new ResourceNotFound("Company don't exists!");
        }

        companyRepository.deleteById(companyId);

        return "Successfully deleted the company.";
    }


    public ApiResponse updateCompany(UUID companyId, CompanyRequest req) {


        Company company = companyRepository.findById(companyId)
                        .orElseThrow(() -> new ResourceNotFound("Company don't exists"));

        boolean changed =
                !Objects.equals(company.getName(), req.getName()) ||
                !Objects.equals(company.getLogoUrl(), req.getLogoUrl()) ||
                !Objects.equals(company.getShortDescription(), req.getShortDescription()) ||
                !Objects.equals(company.getBusinessInfo(), req.getBusinessInfo()) ||
                !Objects.equals(company.getCompanyType(), req.getCompanyType());


        if(!changed) {

            return new ApiResponse(
                    true,
                    "No change detected.",
                    null,
                    null
            );
        }

        company.setName(req.getName());
        company.setLogoUrl(req.getLogoUrl());
        company.setShortDescription(req.getShortDescription());
        company.setBusinessInfo(req.getBusinessInfo());
        company.setCompanyType(req.getCompanyType());

        companyRepository.save(company);

        return new ApiResponse(
                true,
                "Successfully updated the company",
                null,
                null
        );

    }

}
