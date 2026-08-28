package com.rtx.placeintel.repository;

import com.rtx.placeintel.entity.Drive;
import com.rtx.placeintel.entity.enums.DriveStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;


/*
* JPA Specifications build a query dynamically, at runtime, adding only the conditions that are actually present in the request.
* */
public interface DriveRepository extends JpaRepository<Drive, UUID>, JpaSpecificationExecutor<Drive> {

    List<Drive> findByCompanyId(UUID companyId);

    Page<Drive> findByStatus(DriveStatus status, Pageable pageable);

    boolean existsByCompanyIdAndDriveDate(UUID companyId, LocalDate driveDate);

    List<Drive> findByDriveDateBeforeAndStatusNot(LocalDate date, DriveStatus status);

    long countByStatus(DriveStatus status);

    /*
    * @Query tells Spring Data JPA: Don't generate the query from the method name. Use this query that I'm explicitly giving you
    *
    * */
    @Query("SELECT MAX(d.ctcOffered) FROM Drive d")
    Double findHighestCtcOffered();

}
