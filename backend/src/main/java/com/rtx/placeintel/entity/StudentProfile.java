package com.rtx.placeintel.entity;

import com.rtx.placeintel.entity.enums.VerificationStatus;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "Student_profiles")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StudentProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne
    @JoinColumn(name = "user_id", nullable = false, unique = true)
    private  User user;

    @NotBlank
    @Column(nullable = false)
    private String fullName;

    @Column(nullable = false, unique = true)
    private String enrollmentNo;

    private String department;

    private Double cgpa;

    private Double tenthPercentage;

    private Double twelfthPercentage;

    private String linkedinUrl;

    private String githubUsername;

    private String resumeUrl;

    @ElementCollection
    @CollectionTable(name = "student_skills", joinColumns = @JoinColumn(name = "student_profile_id"))
    @Column(name = "skill")
    @Builder.Default
    private List<String> skills = new ArrayList<>();


    @Builder.Default
    @Column(nullable = false)
    private int activeBacklog = 0;

    @Builder.Default
    @Column(nullable = false)
    private boolean profileCompleted = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    /*
     *@Builder.default tells the lombok to use the default value "PENDING",
     * instead of null. If you don't mention this annotation than lombok automatically ignore
     * the default value and sets it to null
     */
    @Builder.Default
    private VerificationStatus verificationStatus = VerificationStatus.PENDING;

    private String verificationNote;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
