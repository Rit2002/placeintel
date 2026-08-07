package com.rtx.placeintel.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "resources")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Resource {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "company_id", nullable = false)
    private Company company;

    @ManyToOne
    @JoinColumn(name = "round_id")
    private Round round;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private ResourceType type;

    @NotBlank
    @Column(nullable = false)
    private String title;

    @ManyToOne
    @JoinColumn(name = "added_by_tpo_id", nullable = false)
    private User addedByTpo;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
}
