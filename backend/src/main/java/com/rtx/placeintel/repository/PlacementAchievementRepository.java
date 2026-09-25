package com.rtx.placeintel.repository;

import com.rtx.placeintel.entity.PlacementAchievement;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface PlacementAchievementRepository
        extends JpaRepository<PlacementAchievement, UUID> {

    /**
     * EntityGraph tells hibernate : When fetching PlacementAchievement,
     * fetch its studentProfile relationship as part of this query
     */
    @EntityGraph(attributePaths = "studentProfile")
    List<PlacementAchievement> findAllByOrderByCreatedAtDesc();
}
