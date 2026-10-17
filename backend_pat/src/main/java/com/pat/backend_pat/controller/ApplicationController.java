package com.pat.backend_pat.controller;

import com.pat.backend_pat.entity.ApplicationRecord;
import com.pat.backend_pat.entity.Job;
import com.pat.backend_pat.entity.ResumeRecord;
import com.pat.backend_pat.entity.StudentProfile;
import com.pat.backend_pat.entity.UserAccount;
import com.pat.backend_pat.repository.ApplicationRepository;
import com.pat.backend_pat.repository.JobRepository;
import com.pat.backend_pat.repository.ResumeRepository;
import com.pat.backend_pat.repository.StudentProfileRepository;
import com.pat.backend_pat.repository.UserRepository;
import java.security.Principal;
import java.time.LocalDateTime;
import java.util.List;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/students/me/applications")
@PreAuthorize("hasRole('STUDENT')")
public class ApplicationController {
    private final UserRepository users;
    private final StudentProfileRepository students;
    private final ApplicationRepository applications;
    private final JobRepository jobs;
    private final ResumeRepository resumes;
    public ApplicationController(UserRepository users, StudentProfileRepository students,
            ApplicationRepository applications, JobRepository jobs, ResumeRepository resumes) {
        this.users = users; this.students = students; this.applications = applications; this.jobs = jobs; this.resumes = resumes;
    }

    @GetMapping
    public List<ApplicationResponse> list(Principal principal) {
        StudentProfile student = currentStudent(principal);
        return applications.findByStudentIdOrderByAppliedAtDesc(student.getStudentId()).stream().map(this::toResponse).toList();
    }

    @PostMapping
    @Transactional
    public ApplicationResponse apply(Principal principal, @RequestBody ApplyRequest request) {
        if (request.jobId() == null) throw new IllegalArgumentException("Select a real placement drive to apply.");
        StudentProfile student = currentStudent(principal);
        Job job = jobs.findById(request.jobId()).orElseThrow(() -> new IllegalArgumentException("This job is not available in the database. Sample cards cannot receive applications."));
        if (!"OPEN".equalsIgnoreCase(job.getStatus()) || !"APPROVED".equalsIgnoreCase(job.getCollegeApprovalStatus())) throw new IllegalArgumentException("This placement drive is not open for applications yet.");
        if (!isCollegeEligible(job.getRequestedCollegeName(), student.getCollegeName())) {
            String targetColleges = job.getRequestedCollegeName();
            throw new IllegalArgumentException("This is a targeted drive. Only students from these college(s) can apply: "
                    + (targetColleges == null || targetColleges.isBlank() ? "the college(s) specified by the company" : targetColleges.replace(",", ", ")));
        }
        if (job.getApplicationDeadline() != null && job.getApplicationDeadline().isBefore(java.time.LocalDate.now())) throw new IllegalArgumentException("The application deadline has passed.");
        if (applications.existsByStudentIdAndJobId(student.getStudentId(), job.getJobId())) throw new IllegalArgumentException("You have already applied to this placement drive.");
        if (job.getMinCgpa() != null && (student.getCgpa() == null || student.getCgpa().compareTo(job.getMinCgpa()) < 0)) throw new IllegalArgumentException("You do not meet the minimum CGPA requirement for this drive.");
        if (job.getMaxBacklogs() != null && (student.getBacklogCount() == null || student.getBacklogCount() > job.getMaxBacklogs())) throw new IllegalArgumentException("You do not meet the backlog requirement for this drive.");
        if (job.getPassingYear() != null && !job.getPassingYear().equals(student.getPassingYear())) throw new IllegalArgumentException("This drive is limited to a different passing year.");
        if (job.getEligibleBranches() != null && !job.getEligibleBranches().isBlank()) {
            if (student.getBranch() == null || student.getBranch().isBlank()) throw new IllegalArgumentException("Complete your branch in My Profile before applying.");
            String requiredBranches = job.getEligibleBranches().toLowerCase(java.util.Locale.ROOT);
            String branch = student.getBranch().toLowerCase(java.util.Locale.ROOT);
            if (!requiredBranches.contains(branch) && !branchMatches(requiredBranches, branch)) throw new IllegalArgumentException("Your branch is not listed as eligible for this drive.");
        }
        ResumeRecord resume = resumes.findFirstByStudentIdAndIsDefaultTrueOrderByUploadedAtDesc(student.getStudentId())
                .orElseThrow(() -> new IllegalArgumentException("Upload a PDF resume before applying."));
        ApplicationRecord record = new ApplicationRecord();
        record.setStudentId(student.getStudentId()); record.setJobId(job.getJobId()); record.setResumeId(resume.getResumeId()); record.setStatus("ROUND_1_SELECTED"); record.setCurrentRound(1); record.setRoundNote("Automatically shortlisted based on the published eligibility criteria.");
        return toResponse(applications.save(record));
    }

    private boolean isCollegeEligible(String targetNames, String studentCollegeName) {
        if (targetNames == null || targetNames.isBlank()) return false;
        if ("*".equals(targetNames.trim()) || "ALL_COLLEGES".equalsIgnoreCase(targetNames.trim())) return true;
        if (studentCollegeName == null || studentCollegeName.isBlank()) return false;
        return java.util.Arrays.stream(targetNames.split(","))
                .map(String::trim).filter(name -> !name.isBlank())
                .anyMatch(name -> name.equalsIgnoreCase(studentCollegeName.trim()));
    }

    private boolean branchMatches(String requiredBranches, String studentBranch) {
        String normalized = studentBranch.replace("engineering", "").replace("(", "").replace(")", "").trim();
        for (String required : requiredBranches.split(",")) {
            String candidate = required.replace("engineering", "").replace("(", "").replace(")", "").trim();
            if (!candidate.isBlank() && (normalized.contains(candidate) || candidate.contains(normalized))) return true;
        }
        return false;
    }

    private ApplicationResponse toResponse(ApplicationRecord application) {
        Job job = jobs.findById(application.getJobId()).orElse(null);
        String company = job == null || job.getEmployer() == null ? "Company" : job.getEmployer().getCompanyName();
        String role = job == null ? "Position no longer available" : job.getJobTitle();
        return new ApplicationResponse(application.getApplicationId(), application.getJobId(), company, role,
                application.getStatus(), application.getAppliedAt() == null ? LocalDateTime.now() : application.getAppliedAt(), application.getCurrentRound() == null ? 0 : application.getCurrentRound(), application.getRoundNote());
    }
    private StudentProfile currentStudent(Principal principal) {
        UserAccount user = users.findByEmailIgnoreCase(principal.getName()).orElseThrow(() -> new IllegalArgumentException("Account not found."));
        return students.findByUserId(user.getUserId()).orElseThrow(() -> new IllegalArgumentException("Student profile not found."));
    }
    public record ApplyRequest(Integer jobId) {}
    public record ApplicationResponse(Integer applicationId, Integer jobId, String company, String role, String status, LocalDateTime appliedAt, Integer currentRound, String roundNote) {}
}
