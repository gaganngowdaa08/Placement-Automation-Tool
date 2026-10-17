package com.pat.backend_pat.repository;

import com.pat.backend_pat.entity.CollegeProfile;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CollegeProfileRepository extends JpaRepository<CollegeProfile, Integer> {
    Optional<CollegeProfile> findByUserId(Integer userId);
}
