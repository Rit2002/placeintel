package com.rtx.placeintel.repository;

import com.rtx.placeintel.entity.Drive;
import com.rtx.placeintel.entity.enums.DriveStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface DriveRepository extends JpaRepository<Drive, UUID> {

    List<Drive> findByCompanyId(UUID companyId);

    List<Drive> findByStatus(DriveStatus status);
}
