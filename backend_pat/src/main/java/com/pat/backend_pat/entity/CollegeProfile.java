package com.pat.backend_pat.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "college_profiles")
@Getter
@Setter
@NoArgsConstructor
public class CollegeProfile {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "college_id")
    private Integer collegeId;

    @Column(name = "user_id", nullable = false, unique = true)
    private Integer userId;
    @Column(name = "college_name", nullable = false, length = 180)
    private String collegeName;
    @Column(name = "college_description", columnDefinition = "TEXT")
    private String collegeDescription;
    @Column(name = "approved_status", nullable = false)
    private Boolean approvedStatus = false;
    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
