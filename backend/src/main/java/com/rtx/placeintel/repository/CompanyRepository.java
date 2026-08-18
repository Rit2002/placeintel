package com.rtx.placeintel.repository;

import com.rtx.placeintel.entity.Company;
import com.rtx.placeintel.entity.Drive;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.awt.print.Pageable;
import java.util.Optional;
import java.util.UUID;

public interface CompanyRepository extends JpaRepository<Company, UUID>, JpaSpecificationExecutor<Company> {

    Optional<Company> findByName(String name);

    boolean existsByName(String name);

}
