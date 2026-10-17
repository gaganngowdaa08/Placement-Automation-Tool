package com.pat.backend_pat.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "students")
@Getter
@Setter
@NoArgsConstructor
public class StudentProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "student_id")
    private Integer studentId;

    @Column(name = "user_id", nullable = false, unique = true)
    private Integer userId;

    @Column(name = "full_name")
    private String fullName;

    @Column(name = "phone_number")
    private String phoneNumber;

    @Column(name = "college_name", length = 180)
    private String collegeName;
    private String usn;
    private String branch;
    @Column(precision = 38, scale = 2)
    private BigDecimal cgpa;
    @Column(name = "backlog_count")
    private Integer backlogCount;
    @Column(name = "passing_year")
    private Integer passingYear;
    @Column(columnDefinition = "TEXT")
    private String skills;
    @Column(columnDefinition = "TEXT")
    private String projects;
    @Column(name = "linkedin_url")
    private String linkedinUrl;
    @Column(name = "github_url")
    private String githubUrl;
    private String address;
    @Column(name = "profile_completed", nullable = false)
    private Boolean profileCompleted = false;

    public StudentProfile(Integer userId, String fullName, String phoneNumber) {
        this.userId = userId;
        this.fullName = fullName;
        this.phoneNumber = phoneNumber;
        this.profileCompleted = false;
    }
}
