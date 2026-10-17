package com.pat.backend_pat.repository;

import com.pat.backend_pat.entity.ResumeRecord;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ResumeRepository extends JpaRepository<ResumeRecord, Integer> {
    List<ResumeRecord> findByStudentIdOrderByUploadedAtDesc(Integer studentId);
    Optional<ResumeRecord> findFirstByStudentIdAndIsDefaultTrueOrderByUploadedAtDesc(Integer studentId);
}
