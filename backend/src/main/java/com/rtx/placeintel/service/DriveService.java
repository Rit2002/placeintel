package com.rtx.placeintel.service;

import com.rtx.placeintel.dto.*;
import com.rtx.placeintel.entity.Company;
import com.rtx.placeintel.entity.Drive;
import com.rtx.placeintel.entity.Round;
import com.rtx.placeintel.entity.User;
import com.rtx.placeintel.entity.enums.DriveStatus;
import com.rtx.placeintel.entity.enums.EmploymentType;
import com.rtx.placeintel.exception.DuplicateResourceException;
import com.rtx.placeintel.exception.ResourceNotFound;
import com.rtx.placeintel.repository.CompanyRepository;
import com.rtx.placeintel.repository.DriveRepository;
import com.rtx.placeintel.service.spec.DriveSpecification;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Comparator;
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
                .eligibleDepartments(
                        req.eligibleDepartments() != null
                        ? req.eligibleDepartments().stream().map(this::normalize).toList()
                        : new ArrayList<>()
                )
                .cutoffCgpa(req.cutOffCgpa())
                .cutOffTenthPercentage(req.cutOffTenthPercentage())
                .cutOffTwelfthPercentage((req.cutOffTwelfthPercentage()))
                .maxAllowedBacklogs(req.maxAllowedBacklogs())
                .driveDate(req.driveDate())
                .createdByTpo(tpo)
                .build();

        attachRounds(drive, req.rounds());

        Drive saved = driveRepository.save(drive);

        String message = "Successfully created a company" + company.getName();


        return new ApiResponse<>(
                true,
                message,
                saved.getId().toString(),
                null
        );
    }



    @Transactional
    public ApiResponse<String> updateDrive(UUID driveId, DriveRequest req) {

        Drive drive = driveRepository.findById(driveId)
                .orElseThrow(() -> new ResourceNotFound("Drive don't exists"));


        drive.setRoleOffered(req.roleOffered());
        drive.setEmploymentType(req.employmentType());
        drive.setWorkMode(req.workMode());
        drive.setCtcOffered(req.ctcOffered());
        drive.setStipend(req.stipend());
        drive.setJobDescription(req.jobDescription());
        drive.setRequiredSkills(req.requiredSkills());
        drive.setEligibleDepartments(
                req.eligibleDepartments() != null
                        ? req.eligibleDepartments().stream().map(this::normalize).toList()
                        : new ArrayList<>()
        );
        drive.setCutoffCgpa(req.cutOffCgpa());
        drive.setCutOffTenthPercentage(req.cutOffTenthPercentage());
        drive.setCutOffTwelfthPercentage(req.cutOffTwelfthPercentage());
        drive.setMaxAllowedBacklogs(req.maxAllowedBacklogs());
        drive.setDriveDate(req.driveDate());


        Drive resp = driveRepository.save(drive);

        return new ApiResponse<>(
                true,
                "Successfully updated the drive",
                resp.getId().toString(),
                null
        );

    }



    @Transactional
    public ApiResponse<String> deleteDrive(UUID driveId) {

        if(!driveRepository.existsById(driveId)) {

            throw new ResourceNotFound("Drive Not Found for given Id");
        }

        driveRepository.deleteById(driveId);

        return new ApiResponse<>(
                true,
                "Successfully deleted the Drive.",
                null,
                null
        );
    }




    public ApiResponse<DriveResponse> getDriveById(UUID driveId) {

        Drive drive = driveRepository.findById(driveId)
                .orElseThrow(() -> new ResourceNotFound("Drive not found."));


        return new  ApiResponse<>(
                true,
                "Successfully fetched the drive.",
                toResponse(drive),
                null
        );
    }



    public ApiResponse<Page<DriveResponse>> searchDrives(
            String skill,
            String department,
            Double minCgpa,
            Integer minTenthPercentage,
            Integer minTwelfthPercentage,
            Integer maxBacklogs,
            EmploymentType employmentType,
            DriveStatus status,
            Pageable pageable
    ) {
        Specification<Drive> spec = DriveSpecification.build(
                skill, department,
                minCgpa, maxBacklogs,
                minTenthPercentage, minTwelfthPercentage,
                employmentType, status
        );

        Page<DriveResponse> results = driveRepository.findAll(spec, pageable)
                .map(this::toResponse);
//Expanded version: .map(drive -> this.toResponse(drive))

        return new ApiResponse<>(
                true,
                "Search completed",
                results,
                null
        );
    }





    public ApiResponse<DriveResponse> getMostRelevantDrive(UUID companyId) {

        List<Drive> drives = driveRepository.findByCompanyId(companyId);

        if (drives.isEmpty()) {
            throw new ResourceNotFound("No drives found for this company");
        }

        /*
        1. Finds the first ongoing drive.
        2. If there is no ongoing drive, finds the drive with the latest date.
        3. If there are no drives at all, throw's an exception.
        */
        Drive best = drives.stream()
                .filter(d -> d.getStatus() == DriveStatus.ONGOING)
                .findFirst()
                .orElseGet(() -> drives.stream()
                        .max(Comparator.comparing(Drive::getDriveDate))
                        .orElseThrow());

        DriveResponse response =  toResponse(best);

        return new ApiResponse<>(
                true,
                "Fetched the recent drive.",
                response,
                null
        );
    }




    // Helper methods
    private DriveResponse toResponse(Drive drive) {
        List<RoundResponse> roundResponses = drive.getRounds().stream()
                .map(r -> new RoundResponse(
                        r.getId(), r.getRoundName(), r.getSequenceNumber(),
                        r.getDescription(), r.getDurationMinutes(), r.getDifficulty()))
                .toList();

        return new DriveResponse(
                drive.getId(), drive.getCompany().getId(), drive.getCompany().getName(),
                drive.getRoleOffered(), drive.getEmploymentType(), drive.getWorkMode(),
                drive.getCtcOffered(), drive.getStipend(), drive.getJobDescription(),
                drive.getRequiredSkills(), drive.getEligibleDepartments(), drive.getCutoffCgpa(),
                drive.getCutOffTenthPercentage(), drive.getCutOffTwelfthPercentage(),
                drive.getMaxAllowedBacklogs(), drive.getStatus(), drive.getDriveDate(),
                roundResponses
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

    private String normalize(String value) {
        return value == null ? null : value.trim().toUpperCase();
    }

}
