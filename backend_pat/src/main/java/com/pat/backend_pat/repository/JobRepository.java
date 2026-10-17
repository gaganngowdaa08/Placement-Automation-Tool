package com.pat.backend_pat.repository;

import com.pat.backend_pat.entity.Job;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface JobRepository extends JpaRepository<Job, Integer> {
    List<Job> findByStatusOrderByCreatedAtDesc(String status);
    List<Job> findByEmployer_UserIdOrderByCreatedAtDesc(Integer userId);
    List<Job> findByCollegeApprovalStatusOrderByCreatedAtDesc(String collegeApprovalStatus);
}
