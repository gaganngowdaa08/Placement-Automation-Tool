package com.pat.backend_pat.repository;

import com.pat.backend_pat.entity.ApplicationRecord;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ApplicationRepository extends JpaRepository<ApplicationRecord, Integer> {
    List<ApplicationRecord> findByStudentIdOrderByAppliedAtDesc(Integer studentId);
    boolean existsByStudentIdAndJobId(Integer studentId, Integer jobId);
    List<ApplicationRecord> findByJobIdOrderByAppliedAtDesc(Integer jobId);
}
