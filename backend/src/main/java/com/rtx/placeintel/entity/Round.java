package com.rtx.placeintel.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "rounds")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Round {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "drive_id", nullable = false)
    private Drive drive;

    @NotBlank
    @Column(nullable = false)
    private String roundName;

    @Column(nullable = false)
    private int sequenceNumber;

    @Column(length = 2000)
    private String description;

    private Integer durationMinutes;

    @Enumerated(EnumType.STRING)
    private RoundDifficulty difficulty;

    @OneToMany(mappedBy = "round", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Resource> resources = new ArrayList<>();
}
