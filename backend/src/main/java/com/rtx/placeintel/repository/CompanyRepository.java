package com.rtx.placeintel.repository;

import com.rtx.placeintel.entity.Company;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.UUID;

public interface CompanyRepository extends JpaRepository<Company, UUID> {

    Optional<Company> findByName(String name);

    boolean existsByName(String name);
}
