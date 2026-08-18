package com.rtx.placeintel.service.spec;

import com.rtx.placeintel.entity.Company;
import com.rtx.placeintel.entity.enums.CompanyType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;

public class CompanySpecification {

    public static Specification<Company> build(String name, CompanyType companyType) {


        return (root, query, cb) -> {

            List<Predicate> predicates = new ArrayList<>();

            if (name != null && !name.isBlank()) {

                predicates.add(cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%"));
            }

            if (companyType != null) {
                predicates.add(cb.equal(root.get("companyType"), companyType));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}