package com.pat.backend_pat.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "student_academic")
@Getter
@Setter
@NoArgsConstructor
public class StudentAcademic {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "academic_id")
    private Integer academicId;

    @Column(name = "student_id", nullable = false, unique = true)
    private Integer studentId;
    private String degree;
    private Double tenth;
    private Double twelfth;
    private Integer semester;
    @Column(columnDefinition = "TEXT")
    private String certifications;
}
