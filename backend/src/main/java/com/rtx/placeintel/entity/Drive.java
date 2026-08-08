package com.rtx.placeintel.entity;

import com.rtx.placeintel.entity.enums.DriveStatus;
import com.rtx.placeintel.entity.enums.EmploymentType;
import com.rtx.placeintel.entity.enums.WorkMode;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "drives")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Drive {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @NotBlank
    @Column(nullable = false)
    private EmploymentType employmentType;

    @Enumerated(EnumType.STRING)
    private WorkMode workMode;

    private Double ctcOffered;

    private Double stipend;

    @Column(length = 4000)
    private String jobDescription;


    /*
    * - @ElementCollection. It is used when you want to store a collection of simple values (like String, Integer, Boolean, etc.)
    *  in the database without creating a separate entity class.
    *
    * - The problem is: A relational database cannot directly store a Java List.
    *   A database table stores rows and columns, not Java collections.
    *   So Hibernate needs instructions on how to store this list.
    *
    * - @ElementCollection : Tells Hibernate --> "This field is a collection of simple values, not another entity."
    * - Hibernate creates another table automatically. Each skill becomes one row.
    *
    * - @CollectionTable :- Used to specify table name ("drive_required_skills") and @JoinColumn(name = "drive_id") --> "Connects every skill back to the Drive using drive_id
    *
    * - @Column(name="skill") :- This specifies the column name in "drive_required_skills" table where the where each string is stored [like java, c++, spring boot].
    *
    * -
    * */
    @ElementCollection
    @CollectionTable(name = "drive_required_skills", joinColumns = @JoinColumn(name = "drive_id"))
    @Column(name = "skill")
    @Builder.Default
    private List<String> requiredSkills = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "drive_required_skills", joinColumns = @JoinColumn(name = "drive_id"))
    @Column(name = "department")
    @Builder.Default
    private List<String> eligibleDepartments = new ArrayList<>();

    private Double cutoffCgpa;

    private int cutoffTenthPercentage;

    private int cutoffTwelfthPercentage;

    @Builder.Default
    @Column(nullable = false)
    private int maxAllowedBacklogs = 0;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private DriveStatus status = DriveStatus.UPCOMING;

    private LocalDate driveDate;

    /*
    * - mappedBy = "drive" :- It tells Hibernate --> "The Round entity already has a field called drive that manages this relationship."
    * */
    @OneToMany(mappedBy = "drive", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("sequenceNumber ASC")
    @Builder.Default
    private List<Round> rounds = new ArrayList<>();

    @ManyToOne
    @JoinColumn(name = "created_by_tpo_id", nullable = false)
    private User createdByTpo;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

}
