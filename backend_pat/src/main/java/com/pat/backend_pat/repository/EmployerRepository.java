package com.pat.backend_pat.repository;

import com.pat.backend_pat.entity.Employer;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EmployerRepository extends JpaRepository<Employer, Integer> {
    Optional<Employer> findByUserId(Integer userId);
}
