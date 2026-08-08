package com.rtx.placeintel.entity;

import com.rtx.placeintel.entity.enums.CompanyType;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "companies")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Company {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @NotBlank
    @Column(nullable = false, unique = true)
    private String name;

    private  String logoUrl;

    @Column(length = 1000)
    private String shortDescription;

    @Column(length = 2000)
    private String businessInfo;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private CompanyType companyType;

    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Drive> drives = new ArrayList<>();

    /*
    * Tells Hibernate what entity to fetch and that there could be many —
    * but produces no column; resolved via mappedBy pointing at the FK on the other table
    * */
    @OneToMany(mappedBy = "company", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Resource> resources = new ArrayList<>();

    /*
    * - A "created_by_tpo_id" column is produced.
    * - Type ("User" ): Hibernate looks for User's primary key field and uses that type.
    * */
    @ManyToOne
    @JoinColumn(name = "created_by_tpo_id", nullable = false)
    private User createdByTpo;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

}
