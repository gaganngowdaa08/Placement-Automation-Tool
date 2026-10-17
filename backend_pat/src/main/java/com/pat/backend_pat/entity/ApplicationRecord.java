package com.pat.backend_pat.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "applications", uniqueConstraints = @UniqueConstraint(name = "unique_application", columnNames = {"student_id", "job_id"}))
@Getter
@Setter
@NoArgsConstructor
public class ApplicationRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "application_id")
    private Integer applicationId;
    @Column(name = "student_id", nullable = false)
    private Integer studentId;
    @Column(name = "job_id", nullable = false)
    private Integer jobId;
    @Column(name = "resume_id", nullable = false)
    private Integer resumeId;
    @Column(nullable = false, length = 30)
    private String status = "Applied";
    @Column(name = "current_round", nullable = false)
    private Integer currentRound = 0;
    @Column(name = "round_note", length = 1000)
    private String roundNote;
    @Column(name = "applied_at", insertable = false, updatable = false)
    private LocalDateTime appliedAt;
}
