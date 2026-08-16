package com.rtx.placeintel.repository;

import com.rtx.placeintel.entity.Drive;
import com.rtx.placeintel.entity.enums.DriveStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;


/*
* JPA Specifications build a query dynamically, at runtime, adding only the conditions that are actually present in the request.
* */
public interface DriveRepository extends JpaRepository<Drive, UUID>, JpaSpecificationExecutor<Drive> {

    Page<Drive> findByCompanyId(UUID companyId, Pageable pageable);

    Page<Drive> findByStatus(DriveStatus status, Pageable pageable);

    boolean existsByCompanyIdAndDriveDate(UUID companyId, LocalDate driveDate);


    List<Drive> findByDriveDateBeforeAndStatusNot(LocalDate date, DriveStatus status);
}
