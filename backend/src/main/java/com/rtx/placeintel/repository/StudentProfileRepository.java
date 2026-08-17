package com.rtx.placeintel.repository;

import com.rtx.placeintel.entity.StudentProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface StudentProfileRepository extends JpaRepository<StudentProfile, UUID> {

    Optional<StudentProfile> findByUserId(UUID uuid);

    boolean existsByEnrollmentNo(String enrollmentNo);

}
