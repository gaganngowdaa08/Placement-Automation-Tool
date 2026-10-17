package com.pat.backend_pat.controller;

import com.pat.backend_pat.entity.Job;
import com.pat.backend_pat.repository.JobRepository;
import java.util.List;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/jobs")
public class JobController {
    private final JobRepository jobRepository;
    public JobController(JobRepository jobRepository) { this.jobRepository = jobRepository; }

    @GetMapping
    public List<Job> listJobs() { return jobRepository.findByStatusOrderByCreatedAtDesc("OPEN").stream().filter(job -> "APPROVED".equalsIgnoreCase(job.getCollegeApprovalStatus())).toList(); }

    @GetMapping("/{id}")
    public ResponseEntity<Job> getJob(@PathVariable Integer id) {
        return jobRepository.findById(id).filter(job -> "OPEN".equalsIgnoreCase(job.getStatus()) && "APPROVED".equalsIgnoreCase(job.getCollegeApprovalStatus()))
                .map(ResponseEntity::ok).orElseGet(() -> ResponseEntity.notFound().build());
    }
}
