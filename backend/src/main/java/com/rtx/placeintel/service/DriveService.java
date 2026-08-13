package com.rtx.placeintel.service;

import com.rtx.placeintel.dto.ApiResponse;
import com.rtx.placeintel.dto.DriveRequest;
import com.rtx.placeintel.dto.RoundRequest;
import com.rtx.placeintel.entity.Company;
import com.rtx.placeintel.entity.Drive;
import com.rtx.placeintel.entity.Round;
import com.rtx.placeintel.entity.User;
import com.rtx.placeintel.exception.DuplicateResourceException;
import com.rtx.placeintel.exception.ResourceNotFound;
import com.rtx.placeintel.repository.CompanyRepository;
import com.rtx.placeintel.repository.DriveRepository;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DriveService {

    private final DriveRepository driveRepository;
    private final CompanyRepository companyRepository;

    @Transactional
    public ApiResponse<String> createDrive(UUID companyId, DriveRequest req, User tpo) {

        if(driveRepository.existsByCompanyIdAndDriveDate(companyId, req.driveDate())) {

            throw new DuplicateResourceException("Drive already exists.");
        }

        Company company = companyRepository.findById(companyId)
                .orElseThrow(() -> new ResourceNotFound("Company not found"));


        Drive drive = Drive.builder()
                .company(company)
                .roleOffered(req.roleOffered())
                .employmentType(req.employmentType())
                .workMode(req.workMode())
                .ctcOffered(req.ctcOffered())
                .stipend(req.stipend())
                .jobDescription(req.jobDescription())
                .requiredSkills(req.requiredSkills())
                .eligibleDepartments(req.eligibleDepartments())
                .cutoffCgpa(req.cutOffCgpa())
                .cutOffTenthPercentage(req.cutOffTenthPercentage())
                .cutOffTwelfthPercentage((req.cutOffTwelfthPercentage()))
                .maxAllowedBacklogs(req.maxAllowedBacklogs())
                .driveDate(req.driveDate())
                .createdByTpo(tpo)
                .build();

        attachRounds(drive, req.rounds());

        driveRepository.save(drive);

        String message = "Successfully created a company" + company.getName();

        return new ApiResponse<>(
                true,
                message,
                null,
                null
        );
    }

    private void attachRounds(Drive drive, List<RoundRequest> rounds) {

        for(RoundRequest rr : rounds) {

            Round round = Round.builder()
                    .drive(drive)
                    .roundName(rr.roundName())
                    .sequenceNumber(rr.sequenceNumber())
                    .description(rr.description())
                    .durationMinutes(rr.durationMinutes())
                    .difficulty(rr.difficulty())
                    .build();

            drive.getRounds().add(round);
        }
    }

}
