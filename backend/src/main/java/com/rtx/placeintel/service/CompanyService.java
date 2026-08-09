package com.rtx.placeintel.service;

import com.rtx.placeintel.dto.CompanyRequest;
import com.rtx.placeintel.dto.CompanyResponse;
import com.rtx.placeintel.entity.Company;
import com.rtx.placeintel.entity.User;
import com.rtx.placeintel.exception.DuplicateResourceException;
import com.rtx.placeintel.repository.CompanyRepository;
import com.rtx.placeintel.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CompanyService {

    private final CompanyRepository companyRepository;
    private final UserRepository userRepository;

    public CompanyResponse createCompany(CompanyRequest req, Authentication auth) {

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

        return new CompanyResponse(
                "Successfully created a company",
                saved.getId(),
                saved.getName()
        );
    }
}
