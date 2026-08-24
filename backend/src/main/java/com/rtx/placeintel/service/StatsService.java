package com.rtx.placeintel.service;

import com.rtx.placeintel.dto.ApiResponse;
import com.rtx.placeintel.dto.HomepageStatsResponse;
import com.rtx.placeintel.entity.enums.ApplicationStatus;
import com.rtx.placeintel.entity.enums.DriveStatus;
import com.rtx.placeintel.repository.ApplicationRepository;
import com.rtx.placeintel.repository.CompanyRepository;
import com.rtx.placeintel.repository.DriveRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class StatsService {

    private final CompanyRepository companyRepository;
    private final DriveRepository driveRepository;
    private final ApplicationRepository applicationRepository;

    public ApiResponse<HomepageStatsResponse> getHomepageStats() {

        long totalCompanies = companyRepository.count();
        long totalDrives = driveRepository.count();
        long totalPlaced = applicationRepository.countByStatus(ApplicationStatus.SELECTED);
        Double highestCtc = driveRepository.findHighestCtcOffered();
        long currentlyHiring = driveRepository.countByStatus(DriveStatus.ONGOING);

        HomepageStatsResponse stats = new HomepageStatsResponse(
                totalCompanies, totalDrives, totalPlaced, highestCtc, currentlyHiring
        );

        return new ApiResponse<>(true, "Homepage stats fetched", stats, null);
    }
}