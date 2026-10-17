package com.pat.backend_pat.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "employers")
@Getter
@Setter
@NoArgsConstructor
public class Employer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "employer_id")
    private Integer employerId;

    @Column(name = "user_id", nullable = false, unique = true)
    private Integer userId;
    @Column(name = "company_name", nullable = false, length = 255)
    private String companyName;
    @Column(name = "company_description", columnDefinition = "TEXT")
    private String companyDescription;
    @Column(name = "approved_status", nullable = false)
    private Boolean approvedStatus = false;
    @Column(name = "rejected_status", nullable = false)
    private Boolean rejectedStatus = false;
    @Column(name = "created_at", insertable = false, updatable = false)
    private LocalDateTime createdAt;
}
