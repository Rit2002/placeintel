package com.rtx.placeintel.repository;

import com.rtx.placeintel.entity.Application;
import com.rtx.placeintel.entity.StudentProfile;
import com.rtx.placeintel.entity.enums.ApplicationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ApplicationRepository extends JpaRepository<Application, UUID> {

    void deleteByStudentProfile(StudentProfile studentProfile);

    boolean existsByStudentProfileIdAndDriveId(UUID studentProfileId, UUID driveId);

    Page<Application> findByStudentProfileId(UUID studentProfileId, Pageable pageable);

    Page<Application> findByDriveId(UUID driveId, Pageable pageable);

    List<Application> findAllByDriveId(UUID driveId);

    long countByStatus(ApplicationStatus status);
}