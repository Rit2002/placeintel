package com.rtx.placeintel.service.spec;

import com.rtx.placeintel.entity.Drive;
import com.rtx.placeintel.entity.enums.DriveStatus;
import com.rtx.placeintel.entity.enums.EmploymentType;
import jakarta.persistence.criteria.Predicate;
import org.springframework.data.jpa.domain.Specification;

import java.util.ArrayList;
import java.util.List;


/*
*  Specification :- It is a functional interface because it has exactly one abstract method (i.e, toPredicate(...)).
*  Why the build method is static? ---> becoz, DriveSpecification class do not contain any instance variable.
*  we need to create  object just to call a method.
* So instead of creating a method we can directly call method by it class name
*
* */

public class DriveSpecification {

    public static Specification<Drive> build(
            String skill,
            String department,
            Double minCgpa,
            Integer minTenthPercentage,
            Integer minTwelfthPercentage,
            Integer maxBacklogs,
            EmploymentType employmentType,
            DriveStatus status
    ) {

        /*
        * - root :— represents the table being queried
        *
        * - cb (CriteriaBuilder) :— a factory for building conditions:
        *       cb.equal(...), cb.lessThanOrEqualTo(...), cb.and(...), etc.
        *       This is the toolkit for constructing a WHERE clause piece by piece, in Java, instead of writing raw SQL.
        *
        * - query :— unused here, but available for more advanced cases (like custom sorting/grouping); ignore it for now.
        * */

        return (root, query, cb) -> {

            // This is List in which we are adding conditions (predicates)
            List<Predicate> predicates = new ArrayList<>();

            if (skill != null && !skill.isBlank()) {


                // cb.isMember(value, collection) :- a condition that checks whether a particular skill exists inside the requiredSkills collection of an entity
                // cb.isMember() returns a Predicate something like this --> "Java" MEMBER OF requiredSkills.

                predicates.add(cb.isMember(skill, root.get("requiredSkills")));
            }

            if (department != null && !department.isBlank()) {
                predicates.add(cb.isMember(department, root.get("eligibleDepartments")));
            }

            /*
            * - root.get("cutoffCgpa") refers to that column.
            * - cb.isNull(...) Create a condition (returns cutoffCgpa IS NULL) that checks whether cutoffCgpa is NULL
            * - cb.lessThanOrEqualTo(root.get("cutoffCgpa"), minCgpa) :- creates a Predicate representing: cutoffCgpa <= minCgpa
            * - cb.or(...) :-generates a query condition like WHERE cutoff_cgpa IS NULL OR cutoff_cgpa <= 7.5
            * - Why "or" ? --> becoz DB checks both the condition unlike programming lang
            * */

            if (minCgpa != null) {
                predicates.add(cb.or(
                        cb.isNull(root.get("cutOffCgpa")),
                        cb.lessThanOrEqualTo(root.get("cutOffCgpa"), minCgpa)
                ));
            }

            if (minTenthPercentage != null) {
                predicates.add(cb.or(
                        cb.isNull(root.get("cutOffTenthPercentage")),
                        cb.lessThanOrEqualTo(root.get("cutOffTenthPercentage"), minTenthPercentage)
                ));
            }

            if (minTwelfthPercentage != null) {
                predicates.add(cb.or(
                        cb.isNull(root.get("cutOffTwelfthPercentage")),
                        cb.lessThanOrEqualTo(root.get("cutOffTwelfthPercentage"), minTwelfthPercentage)
                ));
            }

            if (maxBacklogs != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("maxAllowedBacklogs"), maxBacklogs));
            }

            if (employmentType != null) {
                predicates.add(cb.equal(root.get("employmentType"), employmentType));
            }

            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }

            /*
            * - .and() :- Take all the Predicate conditions stored in predicates and combine them using AND.
            * - cb.and() expects an array of Predicates
            * - new Predicate[0] :- Create a new array of type Predicate with length 0
            * */

            return cb.and(predicates.toArray(new Predicate[0]));
        };
    }
}