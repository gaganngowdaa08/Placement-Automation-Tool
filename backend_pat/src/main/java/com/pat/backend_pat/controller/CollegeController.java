package com.pat.backend_pat.controller;

import com.pat.backend_pat.entity.CollegeProfile;
import com.pat.backend_pat.entity.UserAccount;
import com.pat.backend_pat.entity.Job;
import com.pat.backend_pat.repository.JobRepository;
import com.pat.backend_pat.entity.ApplicationRecord;
import com.pat.backend_pat.entity.StudentProfile;
import com.pat.backend_pat.repository.ApplicationRepository;
import com.pat.backend_pat.repository.StudentProfileRepository;
import java.util.List;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import com.pat.backend_pat.repository.CollegeProfileRepository;
import com.pat.backend_pat.repository.UserRepository;
import java.security.Principal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/college/me/profile")
@PreAuthorize("hasRole('COLLEGE')")
public class CollegeController {
    private final UserRepository users;
    private final CollegeProfileRepository colleges;
    private final JobRepository jobs;
    private final ApplicationRepository applications;
    private final StudentProfileRepository students;
    public CollegeController(UserRepository users, CollegeProfileRepository colleges, JobRepository jobs, ApplicationRepository applications, StudentProfileRepository students) { this.users = users; this.colleges = colleges; this.jobs = jobs; this.applications = applications; this.students = students; }

    @GetMapping
    public CollegeResponse get(Principal principal) { return response(current(principal)); }

    @PutMapping
    @Transactional
    public CollegeResponse save(Principal principal, @RequestBody CollegeRequest request) {
        CollegeProfile college = current(principal);
        if (request.collegeName() != null && !request.collegeName().isBlank()) college.setCollegeName(request.collegeName().trim());
        college.setCollegeDescription(request.description() == null ? "" : request.description().trim());
        return response(colleges.save(college));
    }


    @GetMapping("/requests")
    public List<Job> pendingRequests(Principal principal) {
        String collegeName = current(principal).getCollegeName();
        return jobs.findByCollegeApprovalStatusOrderByCreatedAtDesc("PENDING").stream()
            .filter(job -> isAddressedToCollege(job.getRequestedCollegeName(), collegeName))
            .toList();
    }

    @PostMapping("/requests/{jobId}/decision")
    @Transactional
    public Job decideRequest(Principal principal, @PathVariable Integer jobId, @RequestBody ApprovalRequest request) {
        CollegeProfile college = current(principal);
        Job job = jobs.findById(jobId).orElseThrow(() -> new IllegalArgumentException("Placement request not found."));
        if (!isAddressedToCollege(job.getRequestedCollegeName(), college.getCollegeName())) throw new IllegalArgumentException("This placement request is addressed to a different college.");
        String decision = request.decision() == null ? "" : request.decision().trim().toUpperCase();
        if (!List.of("APPROVED", "REJECTED").contains(decision)) throw new IllegalArgumentException("Choose approve or reject.");
        job.setCollegeApprovalStatus(decision);
        job.setCollegeApprovalNote(request.note() == null ? "" : request.note().trim());
        job.setApprovedByCollegeId(college.getCollegeId());
        return jobs.save(job);
    }

    public record ApprovalRequest(String decision, String note) {}

    @GetMapping("/outcomes")
    public List<PlacementOutcome> outcomes(Principal principal) {
        String collegeName = current(principal).getCollegeName();
        return applications.findAll().stream().map(app -> {
            Job job = jobs.findById(app.getJobId()).orElse(null);
            StudentProfile student = students.findById(app.getStudentId()).orElse(null);
            if (student == null || collegeName == null || student.getCollegeName() == null || !collegeName.equalsIgnoreCase(student.getCollegeName())) return null;
            return new PlacementOutcome(app.getApplicationId(), student.getFullName(),
                job == null || job.getEmployer() == null ? "Company" : job.getEmployer().getCompanyName(),
                job == null ? "Role unavailable" : job.getJobTitle(), app.getStatus(), app.getCurrentRound() == null ? 0 : app.getCurrentRound());
        }).filter(java.util.Objects::nonNull).toList();
    }
    public record PlacementOutcome(Integer applicationId, String studentName, String company, String role, String status, Integer currentRound) {}


    private static boolean isAddressedToCollege(String targets, String collegeName) {
        if (targets == null || targets.isBlank()) return false;
        if ("*".equals(targets.trim()) || "ALL_COLLEGES".equalsIgnoreCase(targets.trim())) return true;
        if (collegeName == null || collegeName.isBlank()) return false;
        return java.util.Arrays.stream(targets.split(","))
                .map(String::trim).filter(name -> !name.isBlank())
                .anyMatch(name -> name.equalsIgnoreCase(collegeName.trim()));
    }

    private CollegeProfile current(Principal principal) {
        UserAccount user = users.findByEmailIgnoreCase(principal.getName()).orElseThrow(() -> new IllegalArgumentException("Account not found."));
        return colleges.findByUserId(user.getUserId()).orElseThrow(() -> new IllegalArgumentException("College profile not found."));
    }
    private CollegeResponse response(CollegeProfile c) { return new CollegeResponse(c.getCollegeName(), c.getCollegeDescription(), Boolean.TRUE.equals(c.getApprovedStatus())); }
    public record CollegeRequest(String collegeName, String description) {}
    public record CollegeResponse(String collegeName, String description, boolean approved) {}
}
