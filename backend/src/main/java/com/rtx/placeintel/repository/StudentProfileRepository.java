package com.rtx.placeintel.repository;

import com.rtx.placeintel.entity.StudentProfile;
import com.rtx.placeintel.entity.enums.VerificationStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, UUID> {

    Optional<StudentProfile> findByUserId(UUID uuid);

    boolean existsByEnrollmentNo(String enrollmentNo);

    Page<StudentProfile> findByVerificationStatus(VerificationStatus status, Pageable pageable);

}
