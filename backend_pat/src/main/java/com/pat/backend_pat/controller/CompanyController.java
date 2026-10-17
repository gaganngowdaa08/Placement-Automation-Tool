package com.pat.backend_pat.controller;

import com.pat.backend_pat.entity.Employer;
import com.pat.backend_pat.entity.Job;
import com.pat.backend_pat.entity.UserAccount;
import com.pat.backend_pat.repository.EmployerRepository;
import com.pat.backend_pat.entity.ApplicationRecord;
import com.pat.backend_pat.entity.ResumeRecord;
import com.pat.backend_pat.entity.StudentProfile;
import com.pat.backend_pat.repository.ApplicationRepository;
import com.pat.backend_pat.repository.ResumeRepository;
import com.pat.backend_pat.repository.StudentProfileRepository;
import com.pat.backend_pat.repository.StudentAcademicRepository;
import com.pat.backend_pat.repository.JobRepository;
import com.pat.backend_pat.repository.UserRepository;
import java.io.IOException;
import java.math.BigDecimal;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.Principal;
import java.time.LocalDate;
import java.util.List;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/company")
@PreAuthorize("hasRole('COMPANY')")
public class CompanyController {
    private final UserRepository users;
    private final EmployerRepository employers;
    private final JobRepository jobs;
    private final ApplicationRepository applications;
    private final StudentProfileRepository students;
    private final StudentAcademicRepository academics;
    private final ResumeRepository resumes;
    private final Path uploadDirectory;
    public CompanyController(UserRepository users, EmployerRepository employers, JobRepository jobs,
            ApplicationRepository applications, StudentProfileRepository students, StudentAcademicRepository academics,
            ResumeRepository resumes, @org.springframework.beans.factory.annotation.Value("${app.upload-dir:/app/uploads/resumes}") String uploadDirectory) {
        this.users = users; this.employers = employers; this.jobs = jobs;
        this.applications = applications; this.students = students; this.academics = academics;
        this.resumes = resumes;
        this.uploadDirectory = Path.of(uploadDirectory).toAbsolutePath().normalize();
    }

    @GetMapping("/me/profile")
    public CompanyProfileResponse getProfile(Principal principal) { return profile(current(principal)); }

    @PutMapping("/me/profile")
    @Transactional
    public CompanyProfileResponse saveProfile(Principal principal, @RequestBody CompanyProfileRequest request) {
        Employer employer = current(principal);
        if (request.companyName() != null && !request.companyName().isBlank()) employer.setCompanyName(request.companyName().trim());
        employer.setCompanyDescription(request.description() == null ? "" : request.description().trim());
        return profile(employers.save(employer));
    }

    @GetMapping("/jobs")
    public List<Job> ownJobs(Principal principal) {
        UserAccount user = user(principal);
        return jobs.findByEmployer_UserIdOrderByCreatedAtDesc(user.getUserId());
    }

    @PostMapping("/jobs")
    @Transactional
    public Job createJob(Principal principal, @RequestBody JobRequest request) {
        Employer employer = current(principal);
        if (request.jobTitle() == null || request.jobTitle().isBlank()) throw new IllegalArgumentException("Job title is required.");
        if (request.applicationDeadline() == null || request.placementDriveDate() == null) throw new IllegalArgumentException("Application deadline and drive date are required.");
        String applicationScope = request.applicationScope() == null ? "TARGETED" : request.applicationScope().trim().toUpperCase(java.util.Locale.ROOT);
        if (!List.of("TARGETED", "POOL").contains(applicationScope)) throw new IllegalArgumentException("Choose targeted colleges or a pool drive.");
        String requestedCollegeName;
        if ("POOL".equals(applicationScope)) {
            requestedCollegeName = "*";
        } else {
            if (request.targetCollegeName() == null || request.targetCollegeName().isBlank()) throw new IllegalArgumentException("Enter at least one target college name.");
            requestedCollegeName = java.util.Arrays.stream(request.targetCollegeName().split(","))
                    .map(String::trim).filter(name -> !name.isBlank()).distinct().collect(java.util.stream.Collectors.joining(", "));
            if (requestedCollegeName.isBlank()) throw new IllegalArgumentException("Enter at least one target college name.");
            if (requestedCollegeName.length() > 180) throw new IllegalArgumentException("Target college names must fit within 180 characters. Use shorter official college names.");
        }
        if (request.salaryPackage() == null || request.salaryPackage().isBlank() || request.jobLocation() == null || request.jobLocation().isBlank())
            throw new IllegalArgumentException("Salary package and job location are required.");
        if (request.applicationDeadline().isBefore(LocalDate.now())) throw new IllegalArgumentException("Application deadline cannot be in the past.");
        Job job = new Job();
        job.setEmployer(employer);
        job.setJobTitle(request.jobTitle().trim());
        job.setJobDescription(request.jobDescription() == null ? "" : request.jobDescription().trim());
        job.setSalaryPackage(request.salaryPackage().trim());
        job.setJobLocation(request.jobLocation().trim());
        job.setMinCgpa(request.minCgpa());
        job.setEligibleBranches(request.eligibleBranches() == null ? "" : request.eligibleBranches().trim());
        job.setMaxBacklogs(request.maxBacklogs());
        job.setPassingYear(request.passingYear());
        job.setApplicationDeadline(request.applicationDeadline());
        job.setPlacementDriveDate(request.placementDriveDate());
        job.setRequestedCollegeName(requestedCollegeName);
        job.setStatus("OPEN");
        job.setCollegeApprovalStatus("PENDING");
        return jobs.save(job);
    }


    @GetMapping("/jobs/{jobId}/applications")
    public List<CandidateResponse> candidates(Principal principal, @org.springframework.web.bind.annotation.PathVariable("jobId") Integer jobId) {
        UserAccount account = user(principal);
        Job job = jobs.findById(jobId).orElseThrow(() -> new IllegalArgumentException("Job not found."));
        if (job.getEmployer() == null || !job.getEmployer().getUserId().equals(account.getUserId())) throw new IllegalArgumentException("You can only review applications for your own jobs.");
        return applications.findByJobIdOrderByAppliedAtDesc(jobId).stream().map(app -> {
            StudentProfile student = students.findById(app.getStudentId()).orElse(null);
            var academic = academics.findByStudentId(app.getStudentId()).orElse(null);
            UserAccount studentAccount = student == null ? null : users.findById(student.getUserId()).orElse(null);
            ResumeRecord resume = app.getResumeId() == null ? null : resumes.findById(app.getResumeId()).orElse(null);
            boolean resumeAvailable = resume != null && resume.getResumeFile() != null && !resume.getResumeFile().isBlank();
            String resumeFileName = resume == null ? "" : displayResumeName(resume);
            return new CandidateResponse(app.getApplicationId(), app.getStudentId(), student == null ? "Student" : student.getFullName(),
                studentAccount == null ? "" : studentAccount.getEmail(), student == null ? "" : student.getPhoneNumber(),
                student == null ? "" : student.getBranch(), student == null || student.getCgpa() == null ? "" : student.getCgpa().toString(),
                student == null || student.getBacklogCount() == null ? 0 : student.getBacklogCount(), student == null ? "" : student.getCollegeName(),
                academic == null || academic.getTenth() == null ? "" : academic.getTenth().toString(), academic == null || academic.getTwelfth() == null ? "" : academic.getTwelfth().toString(),
                student == null ? "" : student.getSkills(), app.getStatus(),
                app.getCurrentRound() == null ? 0 : app.getCurrentRound(), app.getRoundNote(), resumeAvailable, resumeFileName);
        }).toList();
    }

    @GetMapping("/applications/{applicationId}/resume")
    public ResponseEntity<Resource> viewApplicantResume(Principal principal,
            @org.springframework.web.bind.annotation.PathVariable("applicationId") Integer applicationId) throws IOException {
        UserAccount companyAccount = user(principal);
        ApplicationRecord application = applications.findById(applicationId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Application not found."));
        Job job = jobs.findById(application.getJobId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Job not found."));

        // A company may only access resumes attached to applications for its own jobs.
        if (job.getEmployer() == null || !job.getEmployer().getUserId().equals(companyAccount.getUserId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "You can only view resumes for applicants to your own jobs.");
        }

        if (application.getResumeId() == null) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No resume is attached to this application. The student must upload a PDF and apply again.");
        }
        ResumeRecord resume = resumes.findById(application.getResumeId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No resume is attached to this application."));
        if (resume.getResumeFile() == null || resume.getResumeFile().isBlank()) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "The resume file is unavailable.");
        }

        Path resumePath = Path.of(resume.getResumeFile()).toAbsolutePath().normalize();
        if (!resumePath.startsWith(uploadDirectory) || !Files.isRegularFile(resumePath) || !Files.isReadable(resumePath)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "The saved resume file could not be found.");
        }

        Resource file = new UrlResource(resumePath.toUri());
        String displayName = displayResumeName(resume);
        String safeName = Path.of(displayName).getFileName().toString();
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, ContentDisposition.inline().filename(safeName).build().toString())
                .body(file);
    }

    @PutMapping("/applications/{applicationId}/decision")
    @Transactional
    public CandidateDecisionResponse decideCandidate(Principal principal,
            @org.springframework.web.bind.annotation.PathVariable("applicationId") Integer applicationId,
            @RequestBody CandidateDecisionRequest request) {
        UserAccount account = user(principal);
        ApplicationRecord app = applications.findById(applicationId).orElseThrow(() -> new IllegalArgumentException("Application not found."));
        Job job = jobs.findById(app.getJobId()).orElseThrow(() -> new IllegalArgumentException("Job not found."));
        if (job.getEmployer() == null || !job.getEmployer().getUserId().equals(account.getUserId())) throw new IllegalArgumentException("You can only update candidates for your own jobs.");
        if (request.round() == null || request.round() < 1 || request.round() > 5) throw new IllegalArgumentException("Round must be between 1 and 5.");
        String decision = request.decision() == null ? "" : request.decision().trim().toUpperCase();
        if (!List.of("SELECTED", "REJECTED", "IN_PROGRESS").contains(decision)) throw new IllegalArgumentException("Choose Selected, Rejected, or In progress.");
        app.setCurrentRound(request.round());
        app.setRoundNote(request.note() == null ? "" : request.note().trim());
        app.setStatus(decision.equals("SELECTED") ? (request.round() == 5 ? "SELECTED" : "ROUND_" + request.round() + "_SELECTED") : decision.equals("REJECTED") ? "REJECTED_AT_ROUND_" + request.round() : "ROUND_" + request.round() + "_IN_PROGRESS");
        ApplicationRecord saved = applications.save(app);
        return new CandidateDecisionResponse(saved.getApplicationId(), saved.getStatus(), saved.getCurrentRound(), saved.getRoundNote());
    }

    private CompanyProfileResponse profile(Employer e) { return new CompanyProfileResponse(e.getCompanyName(), e.getCompanyDescription(), Boolean.TRUE.equals(e.getApprovedStatus())); }
    private Employer current(Principal principal) {
        UserAccount account = user(principal);
        return employers.findByUserId(account.getUserId()).orElseThrow(() -> new IllegalArgumentException("Company profile not found."));
    }
    private UserAccount user(Principal principal) { return users.findByEmailIgnoreCase(principal.getName()).orElseThrow(() -> new IllegalArgumentException("Account not found.")); }
    private static String displayResumeName(ResumeRecord resume) {
        if (resume.getOriginalFileName() != null && !resume.getOriginalFileName().isBlank()) {
            return resume.getOriginalFileName();
        }
        return resume.getResumeFile() == null ? "Resume.pdf" : Path.of(resume.getResumeFile()).getFileName().toString();
    }

    public record CompanyProfileRequest(String companyName, String description) {}
    public record CompanyProfileResponse(String companyName, String description, boolean approved) {}
    public record CandidateResponse(Integer applicationId, Integer studentId, String studentName, String email, String phone, String branch, String cgpa, Integer backlogs, String collegeName, String tenthPercentage, String twelfthPercentage, String skills, String status, Integer currentRound, String note, boolean resumeAvailable, String resumeFileName) {}
    public record CandidateDecisionRequest(Integer round, String decision, String note) {}
    public record CandidateDecisionResponse(Integer applicationId, String status, Integer currentRound, String note) {}
    public record JobRequest(String jobTitle, String jobDescription, String salaryPackage, String jobLocation,
                             BigDecimal minCgpa, String eligibleBranches, Integer maxBacklogs, Integer passingYear,
                             LocalDate applicationDeadline, LocalDate placementDriveDate, String targetCollegeName, String applicationScope) {}
}
