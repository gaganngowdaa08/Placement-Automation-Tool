# PAT — Phase 3: Job Posting + Job Application Flow
## Task Allocation File | Date: April 2 (Day 10–15)

---

> **Before anyone starts coding today:**
> 1. Everyone runs `git pull origin dev` first
> 2. Everyone runs `mvn spring-boot:run` (backend) or `npm run dev` (frontend) to confirm their base is clean
> 3. Read your own section completely before writing a single line of code
>
> **Rule for Phase 3:** Every time someone finishes a file, they push to `dev` immediately and message Fahim. Nobody moves to the next file without Fahim's confirmation.
>
> **Important reminder:** Phase 3 is the most important phase of the entire project. The core product comes alive here — employers post jobs, students apply, eligibility rules are enforced. Get every null check right. Do not improvise on the EligibilityService logic.

---

## 📋 Overview — Who Builds What in Phase 3

| Person | Files to Build | Depends On |
|---|---|---|
| Tejas | `Job.java` + `JobRepository.java` + `CreateJobDTO.java` | Pull from dev first |
| Aishwarya D S | `Application.java` + `ApplicationRepository.java` + `EligibilityService.java` + `ApplicationService.java` | Tejas must push `Job.java` first |
| B S Aishwarya | `JobValidationService.java` + update `EmployerService.java` + `EmployerController.java` | Nothing — start immediately |
| Manoj | `JobService.java` + `JobController.java` + `StudentApplicationController.java` | Aishwarya DS must push `ApplicationService.java` first |
| Fahim | Review all backend + `SecurityConfig.java` update + `GlobalExceptionHandler.java` update + 13-test Postman suite | All 4 above must push first |
| FE-1 | `JobListPage.jsx` + `JobDetailPage.jsx` + `MyApplicationsPage.jsx` | Nothing — start immediately |
| FE-2 | `EmployerDashboard.jsx` + `PostJobPage.jsx` + `ApplicantsPage.jsx` | Nothing — start immediately |
| FE-3 | `AppRoutes.jsx` updates + `api.js` audit + navigation links + role-based redirect | Nothing — start immediately |

---

> ## ✅ Phase 2 Status — Complete
>
> All Phase 2 features are working as planned. Resume upload (`POST /api/v1/students/resume`) is fully functional end-to-end — file is received as `MultipartFile`, filename is saved to the `resumes` table, and `GET /api/v1/students/resumes` returns the correct list. UI shows a success toast on upload. The `uploadResume()` function in `api.js` is already wired and working.
>
> The resume file is currently stored by filename only. Full disk/cloud storage will be polished in Phase 5 as planned.
>
> **Everyone starts Phase 3 with a clean base. No carry-over items.**

---
---

# 👤 TEJAS — Job.java + JobRepository.java + CreateJobDTO.java

## Your Task
You have three files to build. These are dependencies for every other backend person. Push each file as soon as it is done — do not wait until all three are complete.

## What is @ManyToOne? (Read this before coding)
In Phase 2 you used `@OneToOne` — one User links to one Student. In Phase 3 you use `@ManyToOne`. One Employer can post many Jobs. The `@ManyToOne` annotation goes on the "many" side — the Job entity — pointing to the Employer who owns it. You will see this pattern again in Application.java.

---

## File 1 — `Job.java`

**Where to create it:**
`src/main/java/com/pat/backend_pat/entity/Job.java`

**What this file does:**
This entity maps to the `jobs` table in MySQL. It holds all job posting data. The `@ManyToOne` link to `Employer` is what connects a job to the company that posted it.

**Approach to write this with AI:**
```
I am building a Spring Boot REST API.
Create a JPA entity class called Job
inside package com.pat.backend_pat.entity

Requirements:
- Annotations: @Entity, @Table(name = "jobs"), @Data, @NoArgsConstructor
- Do NOT add @AllArgsConstructor
- Fields:
    Integer jobId           → @Id @GeneratedValue IDENTITY, @Column("job_id")
    Employer employer       → @ManyToOne @JoinColumn("employer_id", nullable = false)
    String jobTitle         → @Column("job_title", nullable = false)
    String jobDescription   → @Column(columnDefinition = "TEXT") — nullable
    String salaryPackage    → @Column("salary_package", nullable = false)
    String jobLocation      → @Column("job_location") — nullable
    BigDecimal minCgpa      → @Column(precision = 3, scale = 2) — nullable
    String eligibleBranches → @Column(columnDefinition = "TEXT") — nullable, plain comma-separated String not a List
    Integer maxBacklogs     → @Column("max_backlogs") — nullable
    Integer passingYear     → @Column("passing_year") — nullable
    LocalDate applicationDeadline → @Column("application_deadline", nullable = false)
    LocalDate placementDriveDate  → @Column("placement_drive_date", nullable = false)
    LocalDateTime createdAt → @Column("created_at", nullable = false), default = LocalDateTime.now()
- Use Jakarta persistence imports
- Use Lombok imports
```

**What the final file should look like:**
```java
package com.pat.backend_pat.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "jobs")
@Data
@NoArgsConstructor
public class Job {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "job_id")
    private Integer jobId;

    @ManyToOne
    @JoinColumn(name = "employer_id", nullable = false)
    private Employer employer;

    @Column(name = "job_title", nullable = false)
    private String jobTitle;

    @Column(name = "job_description", columnDefinition = "TEXT")
    private String jobDescription;

    @Column(name = "salary_package", nullable = false)
    private String salaryPackage;

    @Column(name = "job_location")
    private String jobLocation;

    @Column(name = "min_cgpa", precision = 3, scale = 2)
    private BigDecimal minCgpa;

    @Column(name = "eligible_branches", columnDefinition = "TEXT")
    private String eligibleBranches;

    @Column(name = "max_backlogs")
    private Integer maxBacklogs;

    @Column(name = "passing_year")
    private Integer passingYear;

    @Column(name = "application_deadline", nullable = false)
    private LocalDate applicationDeadline;

    @Column(name = "placement_drive_date", nullable = false)
    private LocalDate placementDriveDate;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
```

**How to verify your file is correct:**
- Zero red underlines in your IDE
- Do NOT add `@AllArgsConstructor` — this was a bug fixed in Phase 2
- `eligibleBranches` is a plain `String`, not a `List<>` — stored as comma-separated e.g. `"CSE,ISE"`
- Run `mvn spring-boot:run` — must still start cleanly

---

## File 2 — `CreateJobDTO.java`

**Where to create it:**
`src/main/java/com/pat/backend_pat/dto/CreateJobDTO.java`

**What this file does:**
This DTO validates job creation requests before they reach the service layer. The annotations are what make the API automatically reject bad data — they are not optional.

**Approach to write this with AI:**
```
I am building a Spring Boot REST API.
Create a DTO class called CreateJobDTO
inside package com.pat.backend_pat.dto

Requirements:
- Use Lombok @Data, @NoArgsConstructor, @AllArgsConstructor
- Required fields with validation:
    String jobTitle          → @NotBlank
    String salaryPackage     → @NotBlank
    LocalDate applicationDeadline → @NotNull @Future (must be future date)
    LocalDate placementDriveDate  → @NotNull (no @Future — validated in service)
- Optional fields (no @NotNull):
    String jobDescription    → no validation
    String jobLocation       → no validation
    BigDecimal minCgpa       → @DecimalMin("0.0") @DecimalMax("10.0")
    String eligibleBranches  → no validation (comma-separated string)
    Integer maxBacklogs      → @Min(0)
    Integer passingYear      → no validation
- Use Jakarta validation (jakarta.validation.constraints)
```

**What the final file should look like:**
```java
package com.pat.backend_pat.dto;

import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateJobDTO {

    @NotBlank(message = "Job title is required")
    private String jobTitle;

    @NotBlank(message = "Salary package is required")
    private String salaryPackage;

    @NotNull(message = "Application deadline is required")
    @Future(message = "Application deadline must be a future date")
    private LocalDate applicationDeadline;

    @NotNull(message = "Placement drive date is required")
    private LocalDate placementDriveDate;

    // Optional fields
    private String jobDescription;
    private String jobLocation;

    @DecimalMin(value = "0.0", message = "CGPA must be at least 0.0")
    @DecimalMax(value = "10.0", message = "CGPA must not exceed 10.0")
    private BigDecimal minCgpa;

    private String eligibleBranches;

    @Min(value = 0, message = "Max backlogs cannot be negative")
    private Integer maxBacklogs;

    private Integer passingYear;
}
```

---

## File 3 — `JobRepository.java`

**Where to create it:**
`src/main/java/com/pat/backend_pat/repository/JobRepository.java`

**What this file does:**
Standard JPA repository plus a custom `@Query` for filtered job search. The `@Query` uses JPQL (not raw SQL). The `:branch IS NULL` condition means — if no filter is passed, skip that condition entirely.

**Approach to write this with AI:**
```
I am building a Spring Boot REST API.
Create a JPA repository interface called JobRepository
inside package com.pat.backend_pat.repository

Requirements:
- Extend JpaRepository<Job, Integer>
- Add method: List<Job> findByEmployer(Employer employer)
- Add a custom @Query method called findJobsWithFilters with two
  optional parameters: String branch and BigDecimal minCgpa
  (both annotated with @Param)
- The JPQL query must:
    - Return all jobs if both params are null
    - Filter by eligibleBranches LIKE %:branch% only if branch is not null
    - Filter by minCgpa <= student's cgpa only if minCgpa is not null
      AND only if the job's minCgpa field itself is not null
- Use correct imports: JpaRepository, Query, Param, List, BigDecimal
```

**What the final file should look like:**
```java
package com.pat.backend_pat.repository;

import com.pat.backend_pat.entity.Employer;
import com.pat.backend_pat.entity.Job;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

public interface JobRepository extends JpaRepository<Job, Integer> {

    List<Job> findByEmployer(Employer employer);

    @Query("SELECT j FROM Job j WHERE " +
           "(:branch IS NULL OR j.eligibleBranches LIKE %:branch%) AND " +
           "(:minCgpa IS NULL OR j.minCgpa IS NULL OR j.minCgpa <= :minCgpa)")
    List<Job> findJobsWithFilters(
        @Param("branch") String branch,
        @Param("minCgpa") BigDecimal minCgpa
    );
}
```

**How to verify your file is correct:**
- `findByEmployer` is used by EmployerService — spelling must be exact
- `findJobsWithFilters` is used by JobService — spelling must be exact
- Run `mvn spring-boot:run` — must start cleanly

## Git Instructions (Tejas)
```bash
git add backend_pat
git commit -m "feat: add Job entity, CreateJobDTO, JobRepository"
git push origin dev
```
Message in group: **"Job.java + CreateJobDTO + JobRepository pushed ✅"**

---
---

# 👤 B S AISHWARYA — JobValidationService.java + EmployerService update + EmployerController.java

## ⚠️ NO WAIT — Start Immediately
You do not depend on Tejas. Your `EmployerController` will call `EmployerService` which calls `JobRepository` — but you are writing the wiring, not the actual repository. Start now.

---

## Your Task
You are building the employer side of job posting. Three things: a validation service for date logic, an update to your existing EmployerService, and a new controller.

---

## File 1 — `ValidationException.java` (Quick prerequisite — 2 minutes)

**Where to create it:**
`src/main/java/com/pat/backend_pat/exception/ValidationException.java`

**What this file does:**
A custom exception thrown when business rules are violated (e.g. drive date before deadline, unapproved employer trying to post). This is different from `@Valid` annotation errors — those handle field-level validation. This handles logic-level validation.

**Approach to write this with AI:**
```
I am building a Spring Boot REST API.
Create a custom exception class called ValidationException
inside package com.pat.backend_pat.exception

Requirements:
- Extend RuntimeException
- Single constructor that takes a String message
- Pass the message to super()
- No other methods or fields needed
```

```java
package com.pat.backend_pat.exception;

public class ValidationException extends RuntimeException {
    public ValidationException(String message) {
        super(message);
    }
}
```

---

## File 2 — `JobValidationService.java`

**Where to create it:**
`src/main/java/com/pat/backend_pat/service/JobValidationService.java`

**What this file does:**
One method only — checks that `placementDriveDate` is not before `applicationDeadline`. This cannot be done with an annotation because it compares two fields against each other. It must be done in code.

**Approach to write this with AI:**
```
I am building a Spring Boot REST API.
Create a Spring service class called JobValidationService
inside package com.pat.backend_pat.service

Requirements:
- Annotate with @Service
- One method: validateDates(LocalDate applicationDeadline, LocalDate placementDriveDate)
- Inside the method: if placementDriveDate is before applicationDeadline,
  throw a ValidationException with message:
  "Placement drive date cannot be before application deadline"
- Import ValidationException from com.pat.backend_pat.exception
- Import LocalDate from java.time
```

```java
package com.pat.backend_pat.service;

import com.pat.backend_pat.exception.ValidationException;
import org.springframework.stereotype.Service;
import java.time.LocalDate;

@Service
public class JobValidationService {

    public void validateDates(LocalDate applicationDeadline, LocalDate placementDriveDate) {
        if (placementDriveDate.isBefore(applicationDeadline)) {
            throw new ValidationException(
                "Placement drive date cannot be before application deadline"
            );
        }
    }
}
```

---

## File 3 — Update `EmployerService.java`

**What to add:**
Open your existing `EmployerService.java`. Add the two new methods below. Do not touch any existing methods.

**Approach to write this with AI:**
```
I have an existing Spring Boot service class called EmployerService.
I need to add two new methods to it. Do not change existing methods.

Method 1 — postJob(Integer userId, CreateJobDTO dto):
- Find the employer using employerRepository.findByUserUserId(userId)
  — throw RuntimeException("Employer not found") if not present
- Check employer.getApprovedStatus() — if false, throw ValidationException:
  "Your employer account is pending admin approval.
   You cannot post jobs until approved."
- Call jobValidationService.validateDates(dto.getApplicationDeadline(),
  dto.getPlacementDriveDate())
- Create a new Job object, set all fields from the dto and from the employer object
- Save and return the job using jobRepository.save(job)

Method 2 — getEmployerJobs(Integer userId):
- Find employer using employerRepository.findByUserUserId(userId)
  — throw RuntimeException("Employer not found") if not present
- Return jobRepository.findByEmployer(employer)

New fields to autowire in the class:
- JobRepository jobRepository
- JobValidationService jobValidationService

New imports needed:
- CreateJobDTO, Job, ValidationException, JobRepository, List
```

**Add these imports at the top (if not already present):**
```java
import com.pat.backend_pat.dto.CreateJobDTO;
import com.pat.backend_pat.entity.Job;
import com.pat.backend_pat.exception.ValidationException;
import com.pat.backend_pat.repository.JobRepository;
import java.util.List;
```

**Add these autowired fields inside the class:**
```java
@Autowired
private JobRepository jobRepository;

@Autowired
private JobValidationService jobValidationService;
```

**Add these two methods inside the class:**
```java
public Job postJob(Integer userId, CreateJobDTO dto) {
    Employer employer = employerRepository.findByUserUserId(userId)
        .orElseThrow(() -> new RuntimeException("Employer not found"));

    if (!employer.getApprovedStatus()) {
        throw new ValidationException(
            "Your employer account is pending admin approval. " +
            "You cannot post jobs until approved."
        );
    }

    jobValidationService.validateDates(
        dto.getApplicationDeadline(),
        dto.getPlacementDriveDate()
    );

    Job job = new Job();
    job.setEmployer(employer);
    job.setJobTitle(dto.getJobTitle());
    job.setJobDescription(dto.getJobDescription());
    job.setSalaryPackage(dto.getSalaryPackage());
    job.setJobLocation(dto.getJobLocation());
    job.setMinCgpa(dto.getMinCgpa());
    job.setEligibleBranches(dto.getEligibleBranches());
    job.setMaxBacklogs(dto.getMaxBacklogs());
    job.setPassingYear(dto.getPassingYear());
    job.setApplicationDeadline(dto.getApplicationDeadline());
    job.setPlacementDriveDate(dto.getPlacementDriveDate());

    return jobRepository.save(job);
}

public List<Job> getEmployerJobs(Integer userId) {
    Employer employer = employerRepository.findByUserUserId(userId)
        .orElseThrow(() -> new RuntimeException("Employer not found"));
    return jobRepository.findByEmployer(employer);
}
```

---

## File 4 — `EmployerController.java`

**Where to create it:**
`src/main/java/com/pat/backend_pat/controller/EmployerController.java`

**What this file does:**
Exposes 3 endpoints for employer actions. `auth.getDetails()` returns the `userId` — this works because Fahim set it up in `JwtFilter.java` in Phase 2.

**Approach to write this with AI:**
```
I am building a Spring Boot REST API.
Create a REST controller class called EmployerController
inside package com.pat.backend_pat.controller

Requirements:
- Annotate with @RestController and @RequestMapping("/api/v1")
- Autowire EmployerService
- Endpoint 1: POST /employers/profile
    - Takes Authentication auth and @Valid @RequestBody EmployerProfileDTO dto
    - Gets userId via (Integer) auth.getDetails()
    - Calls employerService.createProfile(userId, dto)
    - Returns 200 OK with the result
- Endpoint 2: POST /jobs
    - Takes Authentication auth and @Valid @RequestBody CreateJobDTO dto
    - Gets userId via (Integer) auth.getDetails()
    - Calls employerService.postJob(userId, dto)
    - Returns 201 Created with the result
- Endpoint 3: GET /employers/jobs
    - Takes Authentication auth
    - Gets userId via (Integer) auth.getDetails()
    - Calls employerService.getEmployerJobs(userId)
    - Returns 200 OK with the result
- All return type is ResponseEntity<?>
- Import: jakarta.validation.Valid, Spring Security Authentication,
  ResponseEntity, RestController, RequestMapping, PostMapping, GetMapping,
  RequestBody, Autowired
```

```java
package com.pat.backend_pat.controller;

import com.pat.backend_pat.dto.CreateJobDTO;
import com.pat.backend_pat.dto.EmployerProfileDTO;
import com.pat.backend_pat.service.EmployerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class EmployerController {

    @Autowired
    private EmployerService employerService;

    @PostMapping("/employers/profile")
    public ResponseEntity<?> registerProfile(
        Authentication auth,
        @Valid @RequestBody EmployerProfileDTO dto
    ) {
        Integer userId = (Integer) auth.getDetails();
        return ResponseEntity.ok(employerService.createProfile(userId, dto));
    }

    @PostMapping("/jobs")
    public ResponseEntity<?> postJob(
        Authentication auth,
        @Valid @RequestBody CreateJobDTO dto
    ) {
        Integer userId = (Integer) auth.getDetails();
        return ResponseEntity.status(201).body(employerService.postJob(userId, dto));
    }

    @GetMapping("/employers/jobs")
    public ResponseEntity<?> getMyJobs(Authentication auth) {
        Integer userId = (Integer) auth.getDetails();
        return ResponseEntity.ok(employerService.getEmployerJobs(userId));
    }
}
```

**How to verify your file is correct:**
- If `(Integer) auth.getDetails()` throws a `ClassCastException` during testing, message Fahim immediately — it means `JwtFilter.java` needs a fix
- Run `mvn spring-boot:run` — must start cleanly before pushing

## Git Instructions (B S Aishwarya)
```bash
git add backend_pat
git commit -m "feat: add JobValidationService, EmployerController, update EmployerService"
git push origin dev
```
Message in group: **"EmployerController + JobValidationService pushed ✅"**

---
---

# 👤 AISHWARYA D S — Application.java + ApplicationRepository.java + EligibilityService.java + ApplicationService.java

## ⚠️ WAIT BEFORE STARTING
**Do not start until Tejas pushes `Job.java` and you have pulled:**
```bash
git pull origin dev
```
Confirm you can see `entity/Job.java` before proceeding.

---

## Your Task
You are building the application flow. Four files. The most critical one is `EligibilityService.java` — read its section carefully before writing a single line of it.

## What is EligibilityService? (Read this before coding)
This is the single most important piece of business logic in the entire project. It answers one question: **"Is this student eligible to apply for this job?"**

The rule is: check each eligibility criterion **only if it is set on the job**. If a job has no `minCgpa` set (it is `null`), then CGPA is not a filter — all students pass that check. Fail to handle `null` correctly and you will either block everyone from applying or allow everyone through. Both are wrong.

---

## File 1 — `Application.java`

**Where to create it:**
`src/main/java/com/pat/backend_pat/entity/Application.java`

**Approach to write this with AI:**
```
I am building a Spring Boot REST API.
Create a JPA entity class called Application
inside package com.pat.backend_pat.entity

Requirements:
- Annotations: @Entity, @Table(name = "applications"), @Data, @NoArgsConstructor
- Fields:
    Integer applicationId → @Id @GeneratedValue IDENTITY, @Column("application_id")
    Student student       → @ManyToOne @JoinColumn("student_id", nullable = false)
    Job job               → @ManyToOne @JoinColumn("job_id", nullable = false)
    Resume resume         → @ManyToOne @JoinColumn("resume_id", nullable = false)
    String status         → @Column(nullable = false), default value = "Applied"
    LocalDateTime appliedAt → @Column("applied_at", nullable = false),
                              default value = LocalDateTime.now()
- Use Jakarta persistence imports
- Use Lombok imports
```

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "applications")
@Data
@NoArgsConstructor
public class Application {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "application_id")
    private Integer applicationId;

    @ManyToOne
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @ManyToOne
    @JoinColumn(name = "resume_id", nullable = false)
    private Resume resume;

    @Column(name = "status", nullable = false)
    private String status = "Applied";

    @Column(name = "applied_at", nullable = false)
    private LocalDateTime appliedAt = LocalDateTime.now();
}
```

---

## File 2 — `ApplicationRepository.java`

**Where to create it:**
`src/main/java/com/pat/backend_pat/repository/ApplicationRepository.java`

**What `findByStudentAndJob` does:**
This method is used to check if a student already applied for a job before allowing a second application. If it returns a value, we throw an error.

**Approach to write this with AI:**
```
I am building a Spring Boot REST API.
Create a JPA repository interface called ApplicationRepository
inside package com.pat.backend_pat.repository

Requirements:
- Extend JpaRepository<Application, Integer>
- Add method: List<Application> findByStudent(Student student)
- Add method: List<Application> findByJob(Job job)
- Add method: Optional<Application> findByStudentAndJob(Student student, Job job)
  — Spring Data auto-implements this using the method name convention
- Correct imports: JpaRepository, Application, Student, Job, List, Optional
```

```java
package com.pat.backend_pat.repository;

import com.pat.backend_pat.entity.Application;
import com.pat.backend_pat.entity.Job;
import com.pat.backend_pat.entity.Student;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ApplicationRepository extends JpaRepository<Application, Integer> {

    List<Application> findByStudent(Student student);

    List<Application> findByJob(Job job);

    Optional<Application> findByStudentAndJob(Student student, Job job);
}
```

---

## File 3 — `EligibilityService.java`

**Where to create it:**
`src/main/java/com/pat/backend_pat/service/EligibilityService.java`

**Read the comments inside the code before copying it. Each null check is intentional.**

**Approach to write this with AI:**
```
I am building a Spring Boot REST API.
Create a Spring service class called EligibilityService
inside package com.pat.backend_pat.service

Requirements:
- Annotate with @Service
- One method: checkEligibility(Student student, Job job)
  This method throws RuntimeException with a clear rejection reason if
  the student does not meet any of the criteria. It returns void if eligible.
- Apply each of the 4 checks ONLY if the corresponding job field is not null:
    Check 1 — CGPA:
      If job.getMinCgpa() != null AND student.getCgpa() != null:
        If student.getCgpa() < job.getMinCgpa() → throw RuntimeException:
        "Not eligible: Your CGPA X is below the required Y"
    Check 2 — Backlogs:
      If job.getMaxBacklogs() != null AND student.getBacklogCount() != null:
        If student.getBacklogCount() > job.getMaxBacklogs() → throw RuntimeException:
        "Not eligible: You have X backlogs. Maximum allowed is Y"
    Check 3 — Passing Year:
      If job.getPassingYear() != null AND student.getPassingYear() != null:
        If they are not equal → throw RuntimeException:
        "Not eligible: This job is for X graduates only"
    Check 4 — Branch:
      If job.getEligibleBranches() != null AND not blank:
        Split the string by comma, trim each branch, compare case-insensitively
        to student.getBranch(). If no match found → throw RuntimeException:
        "Not eligible: This job is open to X branches only"
- CRITICAL: Every check must guard with a null check FIRST.
  A null job field means no restriction — do not apply that check.
```

```java
package com.pat.backend_pat.service;

import com.pat.backend_pat.entity.Job;
import com.pat.backend_pat.entity.Student;
import org.springframework.stereotype.Service;

@Service
public class EligibilityService {

    public void checkEligibility(Student student, Job job) {

        // Check CGPA only if the job sets a minimum
        if (job.getMinCgpa() != null && student.getCgpa() != null) {
            if (student.getCgpa().compareTo(job.getMinCgpa()) < 0) {
                throw new RuntimeException(
                    "Not eligible: Your CGPA " + student.getCgpa() +
                    " is below the required " + job.getMinCgpa()
                );
            }
        }

        // Check backlogs only if the job sets a maximum
        if (job.getMaxBacklogs() != null && student.getBacklogCount() != null) {
            if (student.getBacklogCount() > job.getMaxBacklogs()) {
                throw new RuntimeException(
                    "Not eligible: You have " + student.getBacklogCount() +
                    " backlogs. Maximum allowed is " + job.getMaxBacklogs()
                );
            }
        }

        // Check passing year only if the job specifies one
        if (job.getPassingYear() != null && student.getPassingYear() != null) {
            if (!student.getPassingYear().equals(job.getPassingYear())) {
                throw new RuntimeException(
                    "Not eligible: This job is for " + job.getPassingYear() +
                    " graduates only"
                );
            }
        }

        // Check branch only if the job specifies eligible branches
        if (job.getEligibleBranches() != null && !job.getEligibleBranches().isBlank()) {
            String[] branches = job.getEligibleBranches().split(",");
            boolean branchFound = false;
            for (String branch : branches) {
                if (branch.trim().equalsIgnoreCase(student.getBranch())) {
                    branchFound = true;
                    break;
                }
            }
            if (!branchFound) {
                throw new RuntimeException(
                    "Not eligible: This job is open to " +
                    job.getEligibleBranches() + " branches only"
                );
            }
        }
    }
}
```

**How to verify your file is correct:**
- Every `if` block checks `!= null` first before comparing values — if any null check is missing, the app will crash with a NullPointerException when a student applies
- The branch check splits by comma and trims whitespace — `"CSE"` and `" CSE"` must both match

---

## File 4 — `ApplicationService.java`

**Where to create it:**
`src/main/java/com/pat/backend_pat/service/ApplicationService.java`

**What this file does:**
Applies 5 checks in order before saving an application: student exists, job exists, resume exists, resume belongs to this student, student has not already applied, student is eligible.

**Approach to write this with AI:**
```
I am building a Spring Boot REST API.
Create a Spring service class called ApplicationService
inside package com.pat.backend_pat.service

Requirements:
- Annotate with @Service
- Autowire: StudentRepository, JobRepository, ResumeRepository,
  ApplicationRepository, EligibilityService

Method 1 — applyForJob(Integer userId, Integer jobId, Integer resumeId):
  Step 1: Find student using studentRepository.findByUserUserId(userId)
          — throw RuntimeException("Student profile not found") if absent
  Step 2: Find job using jobRepository.findById(jobId)
          — throw RuntimeException("Job not found with id: " + jobId) if absent
  Step 3: Find resume using resumeRepository.findById(resumeId)
          — throw RuntimeException("Resume not found") if absent
  Step 4: Verify resume.getStudent().getStudentId() equals student.getStudentId()
          — if not equal, throw RuntimeException("Resume does not belong to this student")
  Step 5: Call applicationRepository.findByStudentAndJob(student, job)
          — if present, throw RuntimeException("You have already applied for this job")
  Step 6: Call eligibilityService.checkEligibility(student, job)
          — this throws its own exception if not eligible
  Step 7: Create new Application, set student, job, resume — save and return

Method 2 — getStudentApplications(Integer userId):
  - Find student using studentRepository.findByUserUserId(userId)
    — throw RuntimeException("Student not found") if absent
  - Return applicationRepository.findByStudent(student)
```

```java
package com.pat.backend_pat.service;

import com.pat.backend_pat.entity.*;
import com.pat.backend_pat.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ApplicationService {

    @Autowired private StudentRepository studentRepository;
    @Autowired private JobRepository jobRepository;
    @Autowired private ResumeRepository resumeRepository;
    @Autowired private ApplicationRepository applicationRepository;
    @Autowired private EligibilityService eligibilityService;

    public Application applyForJob(Integer userId, Integer jobId, Integer resumeId) {

        Student student = studentRepository.findByUserUserId(userId)
            .orElseThrow(() -> new RuntimeException("Student profile not found"));

        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));

        Resume resume = resumeRepository.findById(resumeId)
            .orElseThrow(() -> new RuntimeException("Resume not found"));

        // Resume must belong to this student
        if (!resume.getStudent().getStudentId().equals(student.getStudentId())) {
            throw new RuntimeException("Resume does not belong to this student");
        }

        // Check if already applied
        applicationRepository.findByStudentAndJob(student, job).ifPresent(a -> {
            throw new RuntimeException("You have already applied for this job");
        });

        // Run eligibility check — throws exception with reason if not eligible
        eligibilityService.checkEligibility(student, job);

        Application application = new Application();
        application.setStudent(student);
        application.setJob(job);
        application.setResume(resume);

        return applicationRepository.save(application);
    }

    public List<Application> getStudentApplications(Integer userId) {
        Student student = studentRepository.findByUserUserId(userId)
            .orElseThrow(() -> new RuntimeException("Student not found"));
        return applicationRepository.findByStudent(student);
    }
}
```

## Git Instructions (Aishwarya D S)
```bash
git add backend_pat
git commit -m "feat: add Application entity, EligibilityService, ApplicationService"
git push origin dev
```
Message in group: **"Application + EligibilityService + ApplicationService pushed ✅"**

---
---

# 👤 MANOJ — JobService.java + JobController.java + StudentApplicationController.java

## ⚠️ WAIT BEFORE STARTING
**Do not start until Aishwarya DS pushes `ApplicationService.java` and you have pulled:**
```bash
git pull origin dev
```
Confirm you can see `service/ApplicationService.java` before proceeding.

---

## Your Task
Three files. These are the last backend pieces before Fahim can run the full test suite.

---

## File 1 — `JobService.java`

**Where to create it:**
`src/main/java/com/pat/backend_pat/service/JobService.java`

**Approach to write this with AI:**
```
I am building a Spring Boot REST API.
Create a Spring service class called JobService
inside package com.pat.backend_pat.service

Requirements:
- Annotate with @Service
- Autowire: JobRepository, ApplicationRepository

Method 1 — getAllJobs(String branch, BigDecimal minCgpa):
  - If both branch and minCgpa are null: return jobRepository.findAll()
  - Otherwise: return jobRepository.findJobsWithFilters(branch, minCgpa)

Method 2 — getJobById(Integer jobId):
  - Return jobRepository.findById(jobId)
  - Throw RuntimeException("Job not found with id: " + jobId) if absent

Method 3 — getJobApplicants(Integer jobId):
  - Call getJobById(jobId) to get the job (reuse the method above)
  - Return applicationRepository.findByJob(job)
```
import com.pat.backend_pat.entity.Job;
import com.pat.backend_pat.repository.ApplicationRepository;
import com.pat.backend_pat.repository.JobRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.math.BigDecimal;
import java.util.List;

@Service
public class JobService {

    @Autowired private JobRepository jobRepository;
    @Autowired private ApplicationRepository applicationRepository;

    public List<Job> getAllJobs(String branch, BigDecimal minCgpa) {
        if (branch == null && minCgpa == null) {
            return jobRepository.findAll();
        }
        return jobRepository.findJobsWithFilters(branch, minCgpa);
    }

    public Job getJobById(Integer jobId) {
        return jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found with id: " + jobId));
    }

    public List<Application> getJobApplicants(Integer jobId) {
        Job job = getJobById(jobId);
        return applicationRepository.findByJob(job);
    }
}
```

---

## File 2 — `JobController.java`

**Where to create it:**
`src/main/java/com/pat/backend_pat/controller/JobController.java`

**What this file does:**
Handles 4 endpoints. `GET /jobs` is public (no token needed). The other three require a JWT token.

**Approach to write this with AI:**
```
I am building a Spring Boot REST API.
Create a REST controller class called JobController
inside package com.pat.backend_pat.controller

Requirements:
- Annotate with @RestController and @RequestMapping("/api/v1")
- Autowire: JobService, ApplicationService

Endpoint 1: GET /jobs
  - Optional @RequestParam: String branch, BigDecimal minCgpa (both required = false)
  - Calls jobService.getAllJobs(branch, minCgpa)
  - Returns 200 OK — no JWT token needed

Endpoint 2: GET /jobs/{jobId}
  - @PathVariable Integer jobId
  - Calls jobService.getJobById(jobId)
  - Returns 200 OK — no JWT token needed

Endpoint 3: POST /jobs/{jobId}/apply
  - @PathVariable Integer jobId
  - @RequestBody Map<String, Integer> body — read resumeId as body.get("resumeId")
  - Authentication auth — get userId as (Integer) auth.getDetails()
  - Calls applicationService.applyForJob(userId, jobId, resumeId)
  - Returns 201 Created

Endpoint 4: GET /jobs/{jobId}/applicants
  - @PathVariable Integer jobId
  - Calls jobService.getJobApplicants(jobId)
  - Returns 200 OK

- All return types are ResponseEntity<?>
```

```java
package com.pat.backend_pat.controller;

import com.pat.backend_pat.service.ApplicationService;
import com.pat.backend_pat.service.JobService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class JobController {

    @Autowired private JobService jobService;
    @Autowired private ApplicationService applicationService;

    @GetMapping("/jobs")
    public ResponseEntity<?> getAllJobs(
        @RequestParam(required = false) String branch,
        @RequestParam(required = false) BigDecimal minCgpa
    ) {
        return ResponseEntity.ok(jobService.getAllJobs(branch, minCgpa));
    }

    @GetMapping("/jobs/{jobId}")
    public ResponseEntity<?> getJobById(@PathVariable Integer jobId) {
        return ResponseEntity.ok(jobService.getJobById(jobId));
    }

    @PostMapping("/jobs/{jobId}/apply")
    public ResponseEntity<?> applyForJob(
        @PathVariable Integer jobId,
        @RequestBody Map<String, Integer> body,
        Authentication auth
    ) {
        Integer userId = (Integer) auth.getDetails();
        Integer resumeId = body.get("resumeId");
        return ResponseEntity.status(201)
            .body(applicationService.applyForJob(userId, jobId, resumeId));
    }

    @GetMapping("/jobs/{jobId}/applicants")
    public ResponseEntity<?> getApplicants(@PathVariable Integer jobId) {
        return ResponseEntity.ok(jobService.getJobApplicants(jobId));
    }
}
```

---

## File 3 — `StudentApplicationController.java`

**Where to create it:**
`src/main/java/com/pat/backend_pat/controller/StudentApplicationController.java`

**Approach to write this with AI:**
```
I am building a Spring Boot REST API.
Create a REST controller class called StudentApplicationController
inside package com.pat.backend_pat.controller

Requirements:
- Annotate with @RestController and @RequestMapping("/api/v1")
- Autowire ApplicationService

Endpoint: GET /students/applications
  - Takes Authentication auth
  - Gets userId as (Integer) auth.getDetails()
  - Calls applicationService.getStudentApplications(userId)
  - Returns 200 OK with the list
  - Return type is ResponseEntity<?>
```
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class StudentApplicationController {

    @Autowired private ApplicationService applicationService;

    @GetMapping("/students/applications")
    public ResponseEntity<?> getMyApplications(Authentication auth) {
        Integer userId = (Integer) auth.getDetails();
        return ResponseEntity.ok(
            applicationService.getStudentApplications(userId)
        );
    }
}
```

**How to verify your files are correct:**
- Run `mvn spring-boot:run` — must start with zero errors
- All 3 controllers must be in the `controller` package — not in `service` or anywhere else
- No hardcoded user IDs — always use `auth.getDetails()`

## Git Instructions (Manoj)
```bash
git add backend_pat
git commit -m "feat: add JobService, JobController, StudentApplicationController"
git push origin dev
```
Message in group: **"JobService + Controllers pushed ✅"**

---
---

# 👤 FAHIM — SecurityConfig update + GlobalExceptionHandler update + Postman Test Suite

## ⚠️ WAIT BEFORE STARTING
**Do not start until all 4 backend members have pushed. Run:**
```bash
git pull origin dev
```
Confirm these files all exist before running the server:
`entity/Job.java`, `entity/Application.java`, `service/EligibilityService.java`, `service/ApplicationService.java`, `controller/JobController.java`, `controller/EmployerController.java`

---

## Your Task
Two code changes and one full Postman test suite.

---

## Task 1 — Update `SecurityConfig.java`

Add these two lines to the list of permitted URLs (no token needed for browsing jobs):

**Approach to write this with AI:**
```
I have an existing Spring Boot SecurityConfig.java that uses
Spring Security with JWT. I need to add two new permit rules.

Add these two lines to the existing list of .requestMatchers() that
are already permitted without a token:
  .requestMatchers(HttpMethod.GET, "/api/v1/jobs").permitAll()
  .requestMatchers(HttpMethod.GET, "/api/v1/jobs/**").permitAll()

Do not change anything else in the file.
Show me only the updated section where these lines are added
so I can copy them in the right place.
```

```java
.requestMatchers(HttpMethod.GET, "/api/v1/jobs").permitAll()
.requestMatchers(HttpMethod.GET, "/api/v1/jobs/**").permitAll()
```

All other new endpoints — `POST /jobs`, `POST /jobs/{id}/apply`, `GET /employers/jobs`, `GET /students/applications` — require a valid JWT token. Verify this is already enforced by default in your config.

---

## Task 2 — Update `GlobalExceptionHandler.java`

Add a handler for `ValidationException`:

**Approach to write this with AI:**
```
I have an existing Spring Boot GlobalExceptionHandler.java
annotated with @RestControllerAdvice.
I need to add one new exception handler method to it.

Add this method to the existing class:
- Handle ValidationException from com.pat.backend_pat.exception
- Annotate with @ExceptionHandler(ValidationException.class)
- Method name: handleValidationException(ValidationException ex)
- Return type: ResponseEntity<Map<String, String>>
- Return ResponseEntity.badRequest() with body Map.of("error", ex.getMessage())

Also add this import at the top of the file if not already present:
  import com.pat.backend_pat.exception.ValidationException;

Do not change or remove any existing handler methods.
Show me only the new method and the import line to add.
```

```java
@ExceptionHandler(ValidationException.class)
public ResponseEntity<Map<String, String>> handleValidationException(
    ValidationException ex
) {
    return ResponseEntity.badRequest()
        .body(Map.of("error", ex.getMessage()));
}
```

Add this import at the top if not present:
```java
import com.pat.backend_pat.exception.ValidationException;
```

---

## Task 3 — Postman Test Suite (Run all 13 in order)

| # | Endpoint | What to Send | Expected Result |
|---|---|---|---|
| 1 | `POST /auth/login` (employer) | `{email, password}` of an approved employer | `200` + JWT token |
| 2 | `POST /jobs` | Valid job JSON with all required fields. Use token from test 1. | `201` + job object with `jobId` |
| 3 | `POST /jobs` (missing title) | Same body without `jobTitle` field | `400` + `"Job title is required"` |
| 4 | `POST /jobs` (past deadline) | `applicationDeadline` set to yesterday's date | `400` + date validation error |
| 5 | `POST /jobs` (drive before deadline) | `placementDriveDate` one day before `applicationDeadline` | `400` + `"Placement drive date cannot be before application deadline"` |
| 6 | `GET /jobs` | No token | `200` + array of jobs |
| 7 | `GET /jobs?branch=CSE` | No token | `200` + filtered results |
| 8 | `GET /jobs/{jobId}` | Use `jobId` from test 2. No token. | `200` + single job object |
| 9 | `POST /jobs/{id}/apply` (eligible student) | Login as a student who meets all criteria. Body: `{"resumeId": <id>}` | `201` + application object |
| 10 | `POST /jobs/{id}/apply` (duplicate) | Same student applies again to the same job | `500` or `400` + `"already applied"` message |
| 11 | `POST /jobs/{id}/apply` (CGPA too low) | Student whose CGPA is below job's `minCgpa` | Error with CGPA rejection message |
| 12 | `GET /students/applications` | Student JWT token | `200` + list of applications with `status` field |
| 13 | `GET /employers/jobs` | Employer JWT token | `200` + list of jobs posted by this employer |

**All 13 tests must pass before you message the mentor. Take a screenshot of the results and share it in the group.**

## Git Instructions (Fahim)
```bash
git add backend_pat
git commit -m "fix: update SecurityConfig and GlobalExceptionHandler for Phase 3"
git push origin dev
```
Message in group: **"SecurityConfig + ExceptionHandler updated. All 13 Postman tests passed ✅"**

---
---

# 👤 FE-1 — JobListPage.jsx + JobDetailPage.jsx + MyApplicationsPage.jsx

> **Resume upload is already working from Phase 2.** The `uploadResume()` function in `api.js` is live, `POST /api/v1/students/resume` returns `201`, and the success toast is showing correctly. No changes needed — start directly on the job pages below.

---

## New API exports needed in `api.js`

Add all of these to `api.js` before building any of the pages below:

```javascript
// ── Jobs ──────────────────────────────────────────────────────
export const getAllJobs = (branch, minCgpa) => {
  const params = {};
  if (branch) params.branch = branch;
  if (minCgpa) params.minCgpa = minCgpa;
  return api.get("/jobs", { params });
};

export const getJobById = (jobId) => api.get(`/jobs/${jobId}`);

export const applyForJob = (jobId, resumeId) =>
  api.post(`/jobs/${jobId}/apply`, { resumeId });

export const getMyApplications = () => api.get("/students/applications");

export const getStudentResumes = () => api.get("/students/resumes");
```

---

## Page 1 — `JobListPage.jsx`

**Where to create it:**
`src/pages/JobListPage/JobListPage.jsx`

**What this page does:**
Fetches all jobs on load. Shows them as cards. Filter bar at top. Clicking a card navigates to `/jobs/:jobId`.

**Approach to write this with AI:**
```
Create a React component called JobListPage at
src/pages/JobListPage/JobListPage.jsx.

Requirements:
- Import DashboardLayout from ../../layouts/DashboardLayout
- Import getAllJobs from ../../services/api
- On mount: call getAllJobs() with no filters and store result in state
- State: jobs (array), loading (boolean), branchFilter (string), cgpaFilter (string)
- Show a filter bar with:
    - Text input for Branch (updates branchFilter state)
    - Number input for Min CGPA (updates cgpaFilter state)
    - Search button: calls getAllJobs(branchFilter, cgpaFilter) and updates jobs
    - Clear button: resets both filters and calls getAllJobs() with no args
- Show each job as a card with:
    - Job title (bold)
    - Company name — access as job.employer.companyName
    - Salary package
    - Application deadline
- Each card is clickable — useNavigate to /jobs/:jobId on click
- Show "No jobs found." if array is empty
- Show "Loading jobs..." while fetching
- Use DashboardLayout as wrapper
- Use same inline styling pattern as ProfilePage.jsx
```

---

## Page 2 — `JobDetailPage.jsx`

**Where to create it:**
`src/pages/JobDetailPage/JobDetailPage.jsx`

**What this page does:**
Reads `:jobId` from URL. Fetches full job details and student's resumes. Shows all job info. Apply Now button opens a resume selector. Calls apply endpoint on confirm.

**Approach to write this with AI:**
```
Create a React component called JobDetailPage at
src/pages/JobDetailPage/JobDetailPage.jsx.

Requirements:
- Use useParams from react-router-dom to read jobId from the URL
- On mount: call getJobById(jobId) and getStudentResumes() — store both in state
- Show all job fields: jobTitle, company name (job.employer.companyName),
  salaryPackage, jobLocation, jobDescription, minCgpa, eligibleBranches,
  maxBacklogs, passingYear, applicationDeadline, placementDriveDate
- Show "Apply Now" button
- When Apply Now is clicked:
    - Show an inline section (or simple modal) with a dropdown of the
      student's resumes (use resume.resumeId as value, resume.resumeFile as label)
    - Show a Confirm button
- On Confirm: call applyForJob(jobId, selectedResumeId)
    - On success: showToast green — "Application submitted successfully!"
    - On error: showToast red — use the error message from the backend response
- Use DashboardLayout as wrapper
- Use same inline styling as ProfilePage.jsx
```

---

## Page 3 — `MyApplicationsPage.jsx`

**Where to create it:**
`src/pages/MyApplicationsPage/MyApplicationsPage.jsx`

**What this page does:**
Shows all jobs the logged-in student has applied for, with color-coded status badges.

**Approach to write this with AI:**
```
Create a React component called MyApplicationsPage at
src/pages/MyApplicationsPage/MyApplicationsPage.jsx.

Requirements:
- On mount: call getMyApplications() and store in state
- Show each application as a card or row with:
    - Job title — access as app.job.jobTitle
    - Company name — access as app.job.employer.companyName
    - Salary package — access as app.job.salaryPackage
    - Applied date — access as app.appliedAt (format it to a readable date)
    - Status badge with color coding:
        "Applied"     → blue background
        "Shortlisted" → yellow background
        "Selected"    → green background
        "Rejected"    → red background
- Show "You have not applied for any jobs yet." if the array is empty
- Use DashboardLayout as wrapper
- Use same inline styling as ProfilePage.jsx
```

## Git Instructions (FE-1)
```bash
git add pat-frontend
git commit -m "feat: resume upload fix, add JobListPage, JobDetailPage, MyApplicationsPage"
git push origin dev
```
Message in group: **"Job pages + resume upload fix pushed ✅"**

---
---

# 👤 FE-2 — EmployerDashboard.jsx + PostJobPage.jsx + ApplicantsPage.jsx

## No Dependencies — Start Immediately

---

## New API exports needed in `api.js`

Add these before building the pages:

```javascript
// ── Employer ──────────────────────────────────────────────────
export const postJob = (data) => api.post("/jobs", data);
export const getEmployerJobs = () => api.get("/employers/jobs");
export const getJobApplicants = (jobId) => api.get(`/jobs/${jobId}/applicants`);
```

---

## Page 1 — `EmployerDashboard.jsx`

**Where to create it:**
`src/pages/EmployerDashboard/EmployerDashboard.jsx`

**Approach to write this with AI:**
```
Create a React component called EmployerDashboard at
src/pages/EmployerDashboard/EmployerDashboard.jsx.

Requirements:
- On mount: call getEmployerJobs() and store result in state
- Show heading: "Employer Dashboard"
- Show a stat card: "Jobs Posted" with the count of the jobs array
- Show each job as a row with: jobTitle, salaryPackage, applicationDeadline
- Each row has a "View Applicants" button that navigates to
  /employer/jobs/:jobId/applicants using useNavigate
- Show a "Post New Job" button that navigates to /employer/post-job
- Use DashboardLayout as wrapper
- Use same inline styling as ProfilePage.jsx
```

---

## Page 2 — `PostJobPage.jsx`

**Where to create it:**
`src/pages/PostJobPage/PostJobPage.jsx`

**This is the most important frontend form in Phase 3.** Validation errors from the backend must appear inline next to the relevant field — not as `alert()` popups. Read the requirements carefully.

**Approach to write this with AI:**
```
Create a React component called PostJobPage at
src/pages/PostJobPage/PostJobPage.jsx.

Required fields (mark label with *):
- jobTitle (text input)
- salaryPackage (text input)
- applicationDeadline (date input)
- placementDriveDate (date input)

Optional fields:
- jobDescription (textarea)
- jobLocation (text input)
- minCgpa (number input, step="0.1", min="0", max="10")
- eligibleBranches (text input — comma-separated, e.g. CSE,ISE)
- maxBacklogs (number input, min="0")
- passingYear (number input)

On submit:
- Call postJob(formData) from api.js
- Disable the submit button while the request is in progress
- On 201 success:
    - Show green toast: "Job posted successfully!"
    - Navigate to /employer/dashboard
- On 400 error (field validation):
    - Parse error response — if it contains field-level errors
      (e.g. { jobTitle: "Job title is required" }), show each error
      message as red text directly below the relevant input
    - If it contains a single "error" key
      (e.g. { error: "Placement drive date cannot be before..." }),
      show it as a red banner at the top of the form
- Use DashboardLayout as wrapper
- Use same inline styling as ProfilePage.jsx
```

---

## Page 3 — `ApplicantsPage.jsx`

**Where to create it:**
`src/pages/ApplicantsPage/ApplicantsPage.jsx`

**Approach to write this with AI:**
```
Create a React component called ApplicantsPage at
src/pages/ApplicantsPage/ApplicantsPage.jsx.

Requirements:
- Use useParams to read jobId from the URL
- On mount: call getJobApplicants(jobId) and store in state
- Show a table with columns:
    Student Name   → app.student.fullName
    USN            → app.student.usn
    Branch         → app.student.branch
    CGPA           → app.student.cgpa
    Status         → app.status (color-coded badge same as MyApplicationsPage)
    Applied At     → app.appliedAt
- Show "No applicants yet." if array is empty
- Use DashboardLayout as wrapper
- Use same inline styling as ProfilePage.jsx
```

## Git Instructions (FE-2)
```bash
git add pat-frontend
git commit -m "feat: add EmployerDashboard, PostJobPage, ApplicantsPage"
git push origin dev
```
Message in group: **"Employer pages pushed ✅"**

---
---

# 👤 FE-3 — AppRoutes.jsx + Navigation links + Role-based redirect + api.js audit

## No Dependencies — Start Immediately

---

## Task 1 — Add Phase 3 routes to `AppRoutes.jsx`

Open `src/routes/AppRoutes.jsx`. Inside the protected route block, add these new routes:

```jsx
{/* Student routes */}
<Route path="/jobs" element={<JobListPage />} />
<Route path="/jobs/:jobId" element={<JobDetailPage />} />
<Route path="/my-applications" element={<MyApplicationsPage />} />

{/* Employer routes */}
<Route path="/employer/dashboard" element={<EmployerDashboard />} />
<Route path="/employer/post-job" element={<PostJobPage />} />
<Route path="/employer/jobs/:jobId/applicants" element={<ApplicantsPage />} />
```

Add imports for all 6 new components at the top of `AppRoutes.jsx`. Use the same import pattern as existing pages.

---

## Task 2 — Add navigation links to Student Dashboard

Open the existing student dashboard component. Add two navigation links:
- **Browse Jobs** → navigates to `/jobs`
- **My Applications** → navigates to `/my-applications`

Use `useNavigate` from `react-router-dom` or plain `<a>` tags — whichever pattern the existing dashboard already uses.

---

## Task 3 — Role-based redirect after login

Open `LoginPage.jsx`. Update the navigation logic after successful login:

```javascript
// Replace the current navigate("/dashboard") with:
if (role === "student")  navigate("/dashboard");
if (role === "employer") navigate("/employer/dashboard");
if (role === "admin")    navigate("/dashboard");  // unchanged for now
```

---

## Task 4 — Audit `api.js` for duplicate exports

By end of Phase 3 multiple people will have added exports to `api.js`. Open the file and check for any duplicate export names. If you find any, **do not fix it yourself** — message Fahim in the group and he will coordinate the fix to avoid a merge conflict.

**How to verify your work is correct:**
- Open the browser at `/jobs` — JobListPage must load
- Open `/employer/dashboard` while logged in as an employer — EmployerDashboard must load
- Login as an employer — must land on `/employer/dashboard` not `/dashboard`
- Login as a student — must still land on `/dashboard`

## Git Instructions (FE-3)
```bash
git add pat-frontend
git commit -m "feat: add Phase 3 routes, employer redirect, nav links"
git push origin dev
```
Message in group: **"Routes + nav + redirect updated ✅"**

---
---

## 📌 End of Phase 3 — Definition of Done

Confirm all of these to Fahim before Phase 3 is marked complete:

**Backend:**
- [ ] `entity/Job.java` exists with all fields, correct `@ManyToOne` to `Employer`, no `@AllArgsConstructor`
- [ ] `dto/CreateJobDTO.java` exists with `@NotBlank`, `@Future`, `@DecimalMin`/`@DecimalMax`, `@Min` on correct fields
- [ ] `repository/JobRepository.java` exists with `findByEmployer()` and `findJobsWithFilters()` @Query
- [ ] `exception/ValidationException.java` exists
- [ ] `service/JobValidationService.java` validates `placementDriveDate >= applicationDeadline`
- [ ] `service/EmployerService.java` has `postJob()` that checks approval before saving
- [ ] `controller/EmployerController.java` has `POST /jobs`, `GET /employers/jobs`, `POST /employers/profile`
- [ ] `entity/Application.java` exists with `@ManyToOne` to Student, Job, and Resume
- [ ] `repository/ApplicationRepository.java` has `findByStudentAndJob()` for duplicate check
- [ ] `service/EligibilityService.java` has all 4 null checks — CGPA, backlogs, passing year, branch
- [ ] `service/ApplicationService.java` checks resume ownership, duplicate, and eligibility in order
- [ ] `service/JobService.java` and `controller/JobController.java` exist with all 4 endpoints
- [ ] `controller/StudentApplicationController.java` exists with `GET /students/applications`
- [ ] `SecurityConfig.java` permits `GET /jobs` and `GET /jobs/**` without token
- [ ] `GlobalExceptionHandler.java` handles `ValidationException`
- [ ] All 13 Postman tests pass — Fahim sends screenshot to group

**Frontend:**
- [ ] `JobListPage.jsx` loads jobs, branch and CGPA filter buttons work
- [ ] `JobDetailPage.jsx` shows full job info, Apply Now shows resume dropdown
- [ ] Apply flow works — success toast on `201`, backend error message shown on failure
- [ ] `MyApplicationsPage.jsx` shows all applications with color-coded status badges
- [ ] `EmployerDashboard.jsx` shows posted jobs, View Applicants and Post New Job navigate correctly
- [ ] `PostJobPage.jsx` shows inline validation errors (not `alert()` popups)
- [ ] `ApplicantsPage.jsx` shows student name, USN, branch, CGPA, status
- [ ] `AppRoutes.jsx` has all 6 new routes defined inside the protected route block
- [ ] Employer login redirects to `/employer/dashboard`
- [ ] Student dashboard has Browse Jobs and My Applications navigation links

> **Only when ALL 13 backend Postman tests pass AND the end-to-end flow works in the browser — Employer posts job → Student sees it → Student applies → Employer sees applicant in their list — message the mentor with results. We will then confirm Phase 3 is complete and move to Phase 4 (Recruitment Rounds + Notifications + Admin Panel).**
