package com.rtx.placeintel.entity;

import com.rtx.placeintel.entity.enums.ApplicationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
// Means : A student can apply to a particular drive only once.
@Table(name = "applications", uniqueConstraints = {
        // The specified combination of column values cannot be duplicated.
        @UniqueConstraint(columnNames = {"student_profile_id", "drive_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne
    @JoinColumn(name = "student_profile_id", nullable = false)
    private StudentProfile studentProfile;

    @ManyToOne
    @JoinColumn(name = "drive_id", nullable = false)
    private Drive drive;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private ApplicationStatus status = ApplicationStatus.APPLIED;

    private Double ruleBasedScore;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime appliedAt;
}