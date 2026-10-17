package com.pat.backend_pat.repository;

import com.pat.backend_pat.entity.StudentAcademic;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentAcademicRepository extends JpaRepository<StudentAcademic, Integer> {
    Optional<StudentAcademic> findByStudentId(Integer studentId);
}
