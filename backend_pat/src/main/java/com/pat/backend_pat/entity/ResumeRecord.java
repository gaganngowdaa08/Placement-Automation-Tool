package com.pat.backend_pat.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "resumes")
@Getter
@Setter
@NoArgsConstructor
public class ResumeRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "resume_id")
    private Integer resumeId;
    @Column(name = "student_id")
    private Integer studentId;
    @Column(name = "resume_file", columnDefinition = "TEXT")
    private String resumeFile;
    @Column(name = "original_file_name", length = 255)
    private String originalFileName;
    @Column(name = "uploaded_at", insertable = false, updatable = false)
    private LocalDateTime uploadedAt;
    @Column(name = "is_default")
    private Boolean isDefault = true;
}
