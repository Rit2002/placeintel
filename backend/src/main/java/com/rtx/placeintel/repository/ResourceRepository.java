package com.rtx.placeintel.repository;

import com.rtx.placeintel.entity.Resource;
import com.rtx.placeintel.entity.enums.ResourceType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ResourceRepository extends JpaRepository<Resource, UUID> {

    /*
     * - This method is used to query the resources such as news, yt videos, interview experience etc.
     * - This Method name literally means find by companyId where round_id is NULL
     * */
    List<Resource> findByCompanyIdAndRoundIsNull(UUID companyId);

    List<Resource> findByRoundId(UUID roundId);

}
