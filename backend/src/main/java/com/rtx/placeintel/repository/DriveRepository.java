package com.rtx.placeintel.repository;

import com.rtx.placeintel.entity.Drive;
import com.rtx.placeintel.entity.enums.DriveStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

public interface DriveRepository extends JpaRepository<Drive, UUID> {

    boolean existsByCompanyIdAndDriveDate(UUID companyId, LocalDate driveDate);


    List<Drive> findByDriveDateBeforeAndStatusNot(LocalDate date, DriveStatus status);
}
