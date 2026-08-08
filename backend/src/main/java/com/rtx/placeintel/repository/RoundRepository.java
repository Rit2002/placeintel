package com.rtx.placeintel.repository;

import com.rtx.placeintel.entity.Round;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface RoundRepository extends JpaRepository<Round, UUID> {

    List<Round> findByDriveIdOrderBySequenceNumberAsc(UUID driveId);

}
