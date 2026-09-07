package com.rtx.placeintel.service.spec;

import com.rtx.placeintel.entity.Company;
import com.rtx.placeintel.entity.Drive;
import com.rtx.placeintel.entity.enums.CompanyType;
import jakarta.persistence.criteria.Join;
import jakarta.persistence.criteria.JoinType;
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





    public static Specification<Company> buildEligibilitySpec(
            Double studentCgpa,
            Integer studentTenthPercentage,
            Integer studentTwelfthPercentage,
            Integer studentActiveBacklogs,
            List<String> studentSkills,
            CompanyType companyType
    ) {
        return (root, query, cb) -> {

            // Returns each Company only once
            query.distinct(true);

            // Join the company table with its drives relationship using an INNER JOIN
            Join<Company, Drive> driveJoin = root.join("drives", JoinType.INNER);


            List<Predicate> predicates = new ArrayList<>();

            if (studentCgpa != null) {
                predicates.add(cb.or(
                        /*
                        * cutoffCgpa IS NULL
                        * OR
                        * cutoffCgpa <= 8.2
                        * */
                        cb.isNull(driveJoin.get("cutoffCgpa")),
                        cb.lessThanOrEqualTo(driveJoin.get("cutoffCgpa"), studentCgpa)
                ));
            }

            if (studentTenthPercentage != null) {
                predicates.add(cb.or(
                        cb.isNull(driveJoin.get("cutOffTenthPercentage")),
                        cb.lessThanOrEqualTo(driveJoin.get("cutOffTenthPercentage"), studentTenthPercentage)
                ));
            }

            if (studentTwelfthPercentage != null) {
                predicates.add(cb.or(
                        cb.isNull(driveJoin.get("cutOffTwelfthPercentage")),
                        cb.lessThanOrEqualTo(driveJoin.get("cutOffTwelfthPercentage"), studentTwelfthPercentage)
                ));
            }

            if (studentActiveBacklogs != null) {
                predicates.add(cb.greaterThanOrEqualTo(driveJoin.get("maxAllowedBacklogs"), studentActiveBacklogs));
            }

            if (studentSkills != null && !studentSkills.isEmpty()) {
                predicates.add(driveJoin.get("requiredSkills").in(studentSkills));
            }

            if (companyType != null) {
                predicates.add(cb.equal(root.get("companyType"), companyType));
            }
                    // Combine all conditions / predicates
            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}