package com.pat.backend_pat.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Entity
@Table(name = "jobs")
public class Job {
	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Integer jobId;
	
	
	@ManyToOne
	@JoinColumn(name = "employer_id", nullable = false)
	private Employer employer;
	
	@Column(nullable = false)
	private String jobTitle;
	
	@Column(nullable = false)
	private String jobDescription;
	
	@Column(nullable = false)
	private String salaryPackage;
	
	@Column(nullable = false)
	private String jobLocation;
	
	@Column(precision = 3, scale = 2)
	private BigDecimal minCgpa;
	
	@Column(columnDefinition = "TEXT")
	private String eligibleBranches;
	
	private Integer maxBacklogs;
	
	private Integer passingYear;
	
	@Column(nullable = false)
	private LocalDate applicationDeadline;
	
	@Column(nullable = false)
	private LocalDate placementDriveDate;
	
	@Column(nullable = false, insertable = false, updatable = false)
	private LocalDateTime createdAt;
	
	@Column(nullable = false, length = 20)
	private String status = "OPEN";

    @Column(name = "requested_college_name", length = 180)
    private String requestedCollegeName;

    @Column(name = "college_approval_status", nullable = false, length = 20)
    private String collegeApprovalStatus = "PENDING";

    @Column(name = "college_approval_note", length = 1000)
    private String collegeApprovalNote;

    @Column(name = "approved_by_college_id")
    private Integer approvedByCollegeId;
	

}
