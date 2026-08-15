package com.rtx.placeintel.repository;

import com.rtx.placeintel.entity.Resource;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ResourceRepository extends JpaRepository<Resource, UUID> {

    List<Resource> findByCompanyId(UUID companyId);
}