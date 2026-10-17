# PAT — Phase 4: Recruitment Rounds + Notifications + Admin Panel
## Task Allocation File | Date: April 13th Day 16–21

---

> **Before anyone starts coding today:**
> 1. Everyone runs `git pull origin dev` first
> 2. Everyone runs `mvn spring-boot:run` (backend) or `npm run dev` (frontend) to confirm their base is clean
> 3. Read your own section completely before writing a single line of code
>
> **Rule for Phase 4:** Every time someone finishes a file, they push to `dev` immediately and message Fahim. Nobody moves to the next file without Fahim's confirmation.
>
> **Important reminder:** The Admin approve endpoint must be built and tested in Postman BEFORE the full browser flow can be verified. Fahim builds this first. Everything else runs in parallel but the end-of-phase test is blocked until an employer with `approved_status = true` exists in the database through the real API — not a manual SQL update.

---

## 📋 Overview — Who Builds What in Phase 4

| Person | Files to Build | Depends On |
|---|---|---|
| Fahim | **PRIORITY:** `AdminService.java` + `AdminController.java` + `StatisticsDTO.java` + SecurityConfig update + Postman suite | Pull from dev first — build Admin approve endpoint first |
| Tejas | `RecruitmentRound.java` + `RecruitmentRoundRepository.java` + `RoundResult.java` + `RoundResultRepository.java` | Pull from dev first |
| Aishwarya D S | `RecruitmentRoundService.java` + `RecruitmentRoundController.java` | Tejas must push all 4 entity/repo files first |
| B S Aishwarya | `Notification.java` + `NotificationRepository.java` + `NotificationService.java` | Nothing — start immediately |
| Manoj | `NotificationController.java` + update `ApplicationService.java` to trigger notifications | B S Aishwarya must push `NotificationService.java` first |
| Kundan | `NotificationBell.jsx` + `RoundsManagerPage.jsx` | Nothing — start immediately on UI, wire after backend pushes |
| Dinesh | `AdminDashboard.jsx` + `ManageEmployersPage.jsx` + `ManageStudentsPage.jsx` + `StatCard.jsx` | Nothing — start immediately |
| Narasimha | `AppRoutes.jsx` Phase 4 routes + `api.js` Phase 4 exports + Admin redirect after login | Nothing — start immediately |

---

> ## ⚠️ CRITICAL — Admin Approval Unblocks the Entire Project
>
> There is currently no employer in the database with `approved_status = true` set through the API. This means the real end-to-end flow — Register as Employer → Get Approved → Post Job → Student Applies — has never been tested in the browser.
>
> **Fahim must complete `PUT /admin/employers/{id}/approve` and test it in Postman before any browser end-to-end testing begins.**
>
> Until that endpoint exists, continue building everything else in parallel. But do not attempt the full browser flow test until Fahim confirms the Admin approve endpoint is live.
>
> **Temporary workaround for testing during Phase 4:** Run this SQL in MySQL Workbench to create an admin user directly so you can log in as Admin and test the approve flow once Fahim's controller is live:
> ```sql
> -- First check your users table for the correct column names, then insert:
> INSERT INTO users (email, password_hash, role, created_at)
> VALUES ('admin@pat.com', '$2a$10$YourBCryptHashHere', 'admin', NOW());
> ```
> Ask Fahim to generate the correct BCrypt hash for a test password using the same `BCryptPasswordEncoder` the app already uses.

---
---

# 👤 FAHIM — AdminService.java + AdminController.java + StatisticsDTO.java + SecurityConfig update ⚡ PRIORITY

## ⚠️ Build the Admin Approve Endpoint FIRST
Before reviewing other people's code, before running the Postman suite — build and test `PUT /admin/employers/{id}/approve` first. This single endpoint unblocks the entire project's browser testing. Everything else in this section comes after.

---

## Your Task
Four things: a DTO for statistics, a service for admin operations, a controller exposing all admin endpoints, and a SecurityConfig update to lock everything behind the ADMIN role.

---

## File 1 — `StatisticsDTO.java`

**Where to create it:**
`src/main/java/com/pat/backend_pat/dto/StatisticsDTO.java`

**What this file does:**
A simple response object returned by `GET /admin/statistics`. Holds counts of students, employers, jobs, applications, and selected candidates.

**Approach to write this with AI:**
```
I am building a Spring Boot REST API.
Create a DTO class called StatisticsDTO
inside package com.pat.backend_pat.dto

Requirements:
- Use Lombok @Data, @NoArgsConstructor, @AllArgsConstructor
- Fields (all int):
    int totalStudents
    int totalEmployers
    int totalJobs
    int totalApplications
    int totalSelected
- No validation annotations needed — this is a response-only DTO
```

**What the final file should look like:**
```java
package com.pat.backend_pat.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StatisticsDTO {
    private int totalStudents;
    private int totalEmployers;
    private int totalJobs;
    private int totalApplications;
    private int totalSelected;
}
```

**How to verify your file is correct:**
- Zero red underlines in your IDE
- Run `mvn spring-boot:run` — must start cleanly

---

## File 2 — `AdminService.java`

**Where to create it:**
`src/main/java/com/pat/backend_pat/service/AdminService.java`

**What this file does:**
Contains all admin business logic — fetching all students, all employers, approving an employer, removing an employer, and computing platform statistics.

**Approach to write this with AI:**
```
I am building a Spring Boot REST API.
Create a Spring service class called AdminService
inside package com.pat.backend_pat.service

Requirements:
- Annotate with @Service
- Autowire: StudentRepository, EmployerRepository, JobRepository,
  ApplicationRepository

Method 1 — getAllStudents():
  - Return studentRepository.findAll()
  - Return type: List<Student>

Method 2 — getAllEmployers():
  - Return employerRepository.findAll()
  - Return type: List<Employer>

Method 3 — approveEmployer(Integer employerId):
  - Find employer using employerRepository.findById(employerId)
  - Throw RuntimeException("Employer not found with id: " + employerId) if absent
  - Set employer.setApprovedStatus(true)
  - Save and return the updated employer

Method 4 — removeEmployer(Integer employerId):
  - Find employer using employerRepository.findById(employerId)
  - Throw RuntimeException("Employer not found with id: " + employerId) if absent
  - Call employerRepository.delete(employer)

Method 5 — getStatistics():
  - Query each repository for count:
      totalStudents     = (int) studentRepository.count()
      totalEmployers    = (int) employerRepository.count()
      totalJobs         = (int) jobRepository.count()
      totalApplications = (int) applicationRepository.count()
      totalSelected     = applicationRepository.countByStatus("Selected")
  - Return new StatisticsDTO(totalStudents, totalEmployers,
    totalJobs, totalApplications, totalSelected)
  - Note: you will need to add countByStatus(String status) to
    ApplicationRepository — see note below
```

**Note — add this method to `ApplicationRepository.java` before writing AdminService:**
```java
int countByStatus(String status);
```
This is a Spring Data derived query — no `@Query` needed. Spring auto-implements it.

**What the final file should look like:**
```java
package com.pat.backend_pat.service;

import com.pat.backend_pat.dto.StatisticsDTO;
import com.pat.backend_pat.entity.Employer;
import com.pat.backend_pat.entity.Student;
import com.pat.backend_pat.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class AdminService {

    @Autowired private StudentRepository studentRepository;
    @Autowired private EmployerRepository employerRepository;
    @Autowired private JobRepository jobRepository;
    @Autowired private ApplicationRepository applicationRepository;

    public List<Student> getAllStudents() {
        return studentRepository.findAll();
    }

    public List<Employer> getAllEmployers() {
        return employerRepository.findAll();
    }

    public Employer approveEmployer(Integer employerId) {
        Employer employer = employerRepository.findById(employerId)
            .orElseThrow(() -> new RuntimeException(
                "Employer not found with id: " + employerId));
        employer.setApprovedStatus(true);
        return employerRepository.save(employer);
    }

    public void removeEmployer(Integer employerId) {
        Employer employer = employerRepository.findById(employerId)
            .orElseThrow(() -> new RuntimeException(
                "Employer not found with id: " + employerId));
        employerRepository.delete(employer);
    }

    public StatisticsDTO getStatistics() {
        int totalStudents     = (int) studentRepository.count();
        int totalEmployers    = (int) employerRepository.count();
        int totalJobs         = (int) jobRepository.count();
        int totalApplications = (int) applicationRepository.count();
        int totalSelected     = applicationRepository.countByStatus("Selected");
        return new StatisticsDTO(totalStudents, totalEmployers,
            totalJobs, totalApplications, totalSelected);
    }
}
```

**How to verify your file is correct:**
- Run `mvn spring-boot:run` — must start cleanly
- If `countByStatus` causes an error, confirm you added it to `ApplicationRepository.java` first

---

## File 3 — `AdminController.java`

**Where to create it:**
`src/main/java/com/pat/backend_pat/controller/AdminController.java`

**What this file does:**
Exposes 5 admin endpoints. ALL of them must be restricted to the ADMIN role only — a student or employer token must never be able to call these.

**Approach to write this with AI:**
```
I am building a Spring Boot REST API.
Create a REST controller class called AdminController
inside package com.pat.backend_pat.controller

Requirements:
- Annotate with @RestController and @RequestMapping("/api/v1/admin")
- Autowire AdminService

Endpoint 1: GET /admin/students
  - Calls adminService.getAllStudents()
  - Returns 200 OK with the list

Endpoint 2: GET /admin/employers
  - Calls adminService.getAllEmployers()
  - Returns 200 OK with the list

Endpoint 3: PUT /admin/employers/{employerId}/approve
  - @PathVariable Integer employerId
  - Calls adminService.approveEmployer(employerId)
  - Returns 200 OK with the updated employer object

Endpoint 4: DELETE /admin/employers/{employerId}
  - @PathVariable Integer employerId
  - Calls adminService.removeEmployer(employerId)
  - Returns 204 No Content (ResponseEntity.noContent().build())

Endpoint 5: GET /admin/statistics
  - Calls adminService.getStatistics()
  - Returns 200 OK with StatisticsDTO

- All return types are ResponseEntity<?>
- All 5 endpoints require JWT token — Spring Security handles this
  via SecurityConfig (you will update that next)
```

**What the final file should look like:**
```java
package com.pat.backend_pat.controller;

import com.pat.backend_pat.service.AdminService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin")
public class AdminController {

    @Autowired
    private AdminService adminService;

    @GetMapping("/students")
    public ResponseEntity<?> getAllStudents() {
        return ResponseEntity.ok(adminService.getAllStudents());
    }

    @GetMapping("/employers")
    public ResponseEntity<?> getAllEmployers() {
        return ResponseEntity.ok(adminService.getAllEmployers());
    }

    @PutMapping("/employers/{employerId}/approve")
    public ResponseEntity<?> approveEmployer(@PathVariable Integer employerId) {
        return ResponseEntity.ok(adminService.approveEmployer(employerId));
    }

    @DeleteMapping("/employers/{employerId}")
    public ResponseEntity<?> removeEmployer(@PathVariable Integer employerId) {
        adminService.removeEmployer(employerId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/statistics")
    public ResponseEntity<?> getStatistics() {
        return ResponseEntity.ok(adminService.getStatistics());
    }
}
```

**How to verify your file is correct:**
- Run `mvn spring-boot:run` — must start cleanly
- Test `PUT /api/v1/admin/employers/{id}/approve` in Postman with a valid admin JWT — this is the priority test

---

## Task 4 — Update `SecurityConfig.java`

Add role-based restrictions so only ADMIN tokens can reach `/admin/**` endpoints:

**Approach to write this with AI:**
```
I have an existing Spring Boot SecurityConfig.java.
I need to add one new role restriction rule.

Add this line to the existing .requestMatchers() chain,
BEFORE the general authenticated rule:
  .requestMatchers("/api/v1/admin/**").hasRole("ADMIN")

Do not change anything else. Show me only the updated
section so I can add it in the right place.
```

Add this line in your `SecurityConfig.java` before the catch-all authenticated rule:
```java
.requestMatchers("/api/v1/admin/**").hasRole("ADMIN")
```

**Important:** Check how your `Role` enum is defined. If it is lowercase (`admin`) then use `hasAuthority("admin")` instead of `hasRole("ADMIN")`. Use whichever matches your existing Phase 1 auth setup.

---

## Task 5 — Postman Test Suite for Phase 4 (Run all 15 in order)

| # | Endpoint | What to Send | Expected Result |
|---|---|---|---|
| 1 | `POST /auth/login` (admin) | `{email, password}` of the admin user | `200` + JWT token with role `admin` |
| 2 | `GET /admin/employers` | Admin token from test 1 | `200` + list of employers |
| 3 | `PUT /admin/employers/{id}/approve` | Admin token. Use an unapproved employer's ID. | `200` + employer object with `approvedStatus: true` |
| 4 | `GET /admin/employers` | Admin token | `200` + same employer now shows `approvedStatus: true` |
| 5 | `GET /admin/students` | Admin token | `200` + list of students |
| 6 | `GET /admin/statistics` | Admin token | `200` + `{ totalStudents, totalEmployers, totalJobs, totalApplications, totalSelected }` |
| 7 | `DELETE /admin/employers/{id}` | Admin token. Use a test employer ID. | `204` No Content |
| 8 | `GET /admin/employers` | Admin token | `200` + deleted employer no longer in list |
| 9 | `GET /admin/students` | Student token (NOT admin) | `403` Forbidden — role restriction working |
| 10 | `POST /jobs/{id}/rounds` | Employer token. Body: `{ roundName: "Aptitude Test", roundOrder: 1 }` | `201` + round object |
| 11 | `POST /jobs/{id}/rounds` | Same job, `roundOrder: 1` again | `400` + duplicate order error |
| 12 | `GET /jobs/{id}/rounds` | Any valid token | `200` + list of rounds in order |
| 13 | `PUT /applications/{id}/round-result` | Employer token. Body: `{ roundId, status: "Passed" }` | `200` + updated result |
| 14 | `GET /notifications` | Student token | `200` + notification from round result update |
| 15 | `PUT /notifications/{id}/read` | Student token | `200` + notification `isRead: true` |

**All 15 tests must pass before you message the mentor. Screenshot and share in group.**

## Git Instructions (Fahim)
```bash
git add backend_pat
git commit -m "feat: add AdminService, AdminController, StatisticsDTO, SecurityConfig admin role"
git push origin dev
```
Message in group: **"Admin endpoints live. PUT /approve tested. All 15 Postman tests passed ✅"**

---
---

# 👤 TEJAS — RecruitmentRound.java + RecruitmentRoundRepository.java + RoundResult.java + RoundResultRepository.java

## Your Task
Four files — two entities and two repositories. These are the foundation for Aishwarya DS's service layer. Push each file as soon as it is done.

## What is a Recruitment Round? (Read this before coding)
When an employer shortlists candidates for a job, they run multiple rounds — Aptitude Test, Technical Interview, HR Interview etc. Each round is a `RecruitmentRound` linked to a `Job`. The result for each candidate in each round is a `RoundResult` linked to both an `Application` and a `RecruitmentRound`. One candidate can have many round results — one per round they participate in.

---

## File 1 — `RecruitmentRound.java`

**Where to create it:**
`src/main/java/com/pat/backend_pat/entity/RecruitmentRound.java`

**What this file does:**
Maps to the `recruitment_rounds` table. Each row is one round (e.g. "Aptitude Test") for a specific job. `roundOrder` defines the sequence — Round 1 before Round 2.

**Approach to write this with AI:**
```
I am building a Spring Boot REST API.
Create a JPA entity class called RecruitmentRound
inside package com.pat.backend_pat.entity

Requirements:
- Annotations: @Entity, @Table(name = "recruitment_rounds"), @Data, @NoArgsConstructor
- Fields:
    Integer roundId    → @Id @GeneratedValue IDENTITY, @Column("round_id")
    Job job            → @ManyToOne @JoinColumn("job_id", nullable = false)
    String roundName   → @Column("round_name", nullable = false)
    Integer roundOrder → @Column("round_order", nullable = false)
    LocalDateTime createdAt → @Column("created_at", nullable = false),
                              default = LocalDateTime.now()
- Use Jakarta persistence imports
- Use Lombok imports
```

**What the final file should look like:**
```java
package com.pat.backend_pat.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "recruitment_rounds")
@Data
@NoArgsConstructor
public class RecruitmentRound {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "round_id")
    private Integer roundId;

    @ManyToOne
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;

    @Column(name = "round_name", nullable = false)
    private String roundName;

    @Column(name = "round_order", nullable = false)
    private Integer roundOrder;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
```

**How to verify your file is correct:**
- Zero red underlines in your IDE
- Run `mvn spring-boot:run` — a new `recruitment_rounds` table must appear in MySQL

---

## File 2 — `RecruitmentRoundRepository.java`

**Where to create it:**
`src/main/java/com/pat/backend_pat/repository/RecruitmentRoundRepository.java`

**What this file does:**
Standard JPA repository plus two custom methods — one to get rounds in order, one to check if a round order already exists for a job (used to prevent duplicates).

**Approach to write this with AI:**
```
I am building a Spring Boot REST API.
Create a JPA repository interface called RecruitmentRoundRepository
inside package com.pat.backend_pat.repository

Requirements:
- Extend JpaRepository<RecruitmentRound, Integer>
- Add method: List<RecruitmentRound> findByJobOrderByRoundOrderAsc(Job job)
  — returns all rounds for a job sorted by roundOrder ascending
- Add method: boolean existsByJobAndRoundOrder(Job job, Integer roundOrder)
  — returns true if a round with that order already exists for that job
  — used to prevent duplicate round orders
- Correct imports: JpaRepository, RecruitmentRound, Job, List
```

**What the final file should look like:**
```java
package com.pat.backend_pat.repository;

import com.pat.backend_pat.entity.Job;
import com.pat.backend_pat.entity.RecruitmentRound;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RecruitmentRoundRepository extends JpaRepository<RecruitmentRound, Integer> {

    List<RecruitmentRound> findByJobOrderByRoundOrderAsc(Job job);

    boolean existsByJobAndRoundOrder(Job job, Integer roundOrder);
}
```

---

## File 3 — `RoundResult.java`

**Where to create it:**
`src/main/java/com/pat/backend_pat/entity/RoundResult.java`

**What this file does:**
Maps to the `round_results` table. Each row tracks how one candidate (via their Application) performed in one specific round. Status is one of: `Passed`, `Failed`, `Pending`.

**Approach to write this with AI:**
```
I am building a Spring Boot REST API.
Create a JPA entity class called RoundResult
inside package com.pat.backend_pat.entity

Requirements:
- Annotations: @Entity, @Table(name = "round_results"), @Data, @NoArgsConstructor
- Fields:
    Integer resultId       → @Id @GeneratedValue IDENTITY, @Column("result_id")
    Application application → @ManyToOne @JoinColumn("application_id", nullable = false)
    RecruitmentRound round  → @ManyToOne @JoinColumn("round_id", nullable = false)
    String status          → @Column(nullable = false), default = "Pending"
                             valid values are: "Passed", "Failed", "Pending"
    LocalDateTime updatedAt → @Column("updated_at", nullable = false),
                              default = LocalDateTime.now()
- Use Jakarta persistence imports
- Use Lombok imports
```

**What the final file should look like:**
```java
package com.pat.backend_pat.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "round_results")
@Data
@NoArgsConstructor
public class RoundResult {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "result_id")
    private Integer resultId;

    @ManyToOne
    @JoinColumn(name = "application_id", nullable = false)
    private Application application;

    @ManyToOne
    @JoinColumn(name = "round_id", nullable = false)
    private RecruitmentRound round;

    @Column(nullable = false)
    private String status = "Pending";

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
}
```

---

## File 4 — `RoundResultRepository.java`

**Where to create it:**
`src/main/java/com/pat/backend_pat/repository/RoundResultRepository.java`

**What this file does:**
Standard JPA repository with one custom method to find an existing result for a specific application and round — used to update it instead of creating duplicates.

**Approach to write this with AI:**
```
I am building a Spring Boot REST API.
Create a JPA repository interface called RoundResultRepository
inside package com.pat.backend_pat.repository

Requirements:
- Extend JpaRepository<RoundResult, Integer>
- Add method: Optional<RoundResult> findByApplicationAndRound(
    Application application, RecruitmentRound round)
  — used to check if a result already exists before creating a new one
- Correct imports: JpaRepository, RoundResult, Application,
  RecruitmentRound, Optional
```

**What the final file should look like:**
```java
package com.pat.backend_pat.repository;

import com.pat.backend_pat.entity.Application;
import com.pat.backend_pat.entity.RecruitmentRound;
import com.pat.backend_pat.entity.RoundResult;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface RoundResultRepository extends JpaRepository<RoundResult, Integer> {

    Optional<RoundResult> findByApplicationAndRound(
        Application application, RecruitmentRound round);
}
```

**How to verify your files are correct:**
- Run `mvn spring-boot:run` — two new tables must appear in MySQL: `recruitment_rounds` and `round_results`
- Zero red underlines across all 4 files

## Git Instructions (Tejas)
```bash
git add backend_pat
git commit -m "feat: add RecruitmentRound, RoundResult entities and repositories"
git push origin dev
```
Message in group: **"RecruitmentRound + RoundResult entities and repos pushed ✅"**

---
---

# 👤 AISHWARYA D S — RecruitmentRoundService.java + RecruitmentRoundController.java

## ⚠️ WAIT BEFORE STARTING
**Do not start until Tejas pushes all 4 files and you have pulled:**
```bash
git pull origin dev
```
Confirm you can see `entity/RecruitmentRound.java`, `entity/RoundResult.java`, `repository/RecruitmentRoundRepository.java`, and `repository/RoundResultRepository.java` before proceeding.

---

## Your Task
Two files — the service and controller for recruitment rounds. The service handles creating rounds, updating results, and triggering notifications. The controller exposes three endpoints.

## What does this service do? (Read before coding)
The employer creates rounds for a job (e.g. Round 1 = Aptitude Test, Round 2 = Technical Interview). Then for each round, the employer marks each candidate as Passed, Failed, or Pending. When a result is updated, the system automatically creates a notification for that student — this is why `NotificationService` is a dependency. You will autowire it even though B S Aishwarya is building it in parallel. Spring handles the wiring at runtime.

---

## File 1 — `RecruitmentRoundService.java`

**Where to create it:**
`src/main/java/com/pat/backend_pat/service/RecruitmentRoundService.java`

**What this file does:**
Handles creating rounds (with duplicate order check), listing rounds for a job, and updating round results (which also triggers a notification).

**Approach to write this with AI:**
```
I am building a Spring Boot REST API.
Create a Spring service class called RecruitmentRoundService
inside package com.pat.backend_pat.service

Requirements:
- Annotate with @Service
- Autowire: JobRepository, RecruitmentRoundRepository,
  ApplicationRepository, RoundResultRepository, NotificationService

Method 1 — createRound(Integer jobId, String roundName, Integer roundOrder):
  - Find job using jobRepository.findById(jobId)
    — throw RuntimeException("Job not found") if absent
  - Check if round order already exists using
    roundRepository.existsByJobAndRoundOrder(job, roundOrder)
    — if true, throw RuntimeException(
      "A round with order " + roundOrder + " already exists for this job")
  - Create new RecruitmentRound, set job, roundName, roundOrder
  - Save and return

Method 2 — getRoundsForJob(Integer jobId):
  - Find job using jobRepository.findById(jobId)
    — throw RuntimeException("Job not found") if absent
  - Return roundRepository.findByJobOrderByRoundOrderAsc(job)

Method 3 — updateRoundResult(Integer applicationId, Integer roundId, String status):
  - Find application using applicationRepository.findById(applicationId)
    — throw RuntimeException("Application not found") if absent
  - Find round using roundRepository.findById(roundId)
    — throw RuntimeException("Round not found") if absent
  - Check if result already exists using
    roundResultRepository.findByApplicationAndRound(application, round)
    — if present: update its status and updatedAt, save
    — if absent: create new RoundResult, set application, round, status, save
  - After saving: call notificationService.createNotification(
      application.getStudent().getUser().getUserId(),
      "Your result for round '" + round.getRoundName() +
      "' has been updated to: " + status
    )
  - Return the saved RoundResult
```

**What the final file should look like:**
```java
package com.pat.backend_pat.service;

import com.pat.backend_pat.entity.*;
import com.pat.backend_pat.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
public class RecruitmentRoundService {

    @Autowired private JobRepository jobRepository;
    @Autowired private RecruitmentRoundRepository roundRepository;
    @Autowired private ApplicationRepository applicationRepository;
    @Autowired private RoundResultRepository roundResultRepository;
    @Autowired private NotificationService notificationService;

    public RecruitmentRound createRound(Integer jobId, String roundName, Integer roundOrder) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found"));

        if (roundRepository.existsByJobAndRoundOrder(job, roundOrder)) {
            throw new RuntimeException(
                "A round with order " + roundOrder + " already exists for this job");
        }

        RecruitmentRound round = new RecruitmentRound();
        round.setJob(job);
        round.setRoundName(roundName);
        round.setRoundOrder(roundOrder);
        return roundRepository.save(round);
    }

    public List<RecruitmentRound> getRoundsForJob(Integer jobId) {
        Job job = jobRepository.findById(jobId)
            .orElseThrow(() -> new RuntimeException("Job not found"));
        return roundRepository.findByJobOrderByRoundOrderAsc(job);
    }

    public RoundResult updateRoundResult(Integer applicationId,
                                          Integer roundId, String status) {
        Application application = applicationRepository.findById(applicationId)
            .orElseThrow(() -> new RuntimeException("Application not found"));

        RecruitmentRound round = roundRepository.findById(roundId)
            .orElseThrow(() -> new RuntimeException("Round not found"));

        Optional<RoundResult> existing =
            roundResultRepository.findByApplicationAndRound(application, round);

        RoundResult result;
        if (existing.isPresent()) {
            result = existing.get();
            result.setStatus(status);
            result.setUpdatedAt(LocalDateTime.now());
        } else {
            result = new RoundResult();
            result.setApplication(application);
            result.setRound(round);
            result.setStatus(status);
        }

        RoundResult saved = roundResultRepository.save(result);

        notificationService.createNotification(
            application.getStudent().getUser().getUserId(),
            "Your result for round '" + round.getRoundName() +
            "' has been updated to: " + status
        );

        return saved;
    }
}
```

**How to verify your file is correct:**
- `application.getStudent().getUser().getUserId()` — this chain must match your Student and User entity field names exactly. Check `Student.java` for the field name of the User relationship before using this.
- Run `mvn spring-boot:run` — must start cleanly

---

## File 2 — `RecruitmentRoundController.java`

**Where to create it:**
`src/main/java/com/pat/backend_pat/controller/RecruitmentRoundController.java`

**What this file does:**
Exposes 3 endpoints — create round, list rounds, update round result.

**Approach to write this with AI:**
```
I am building a Spring Boot REST API.
Create a REST controller class called RecruitmentRoundController
inside package com.pat.backend_pat.controller

Requirements:
- Annotate with @RestController and @RequestMapping("/api/v1")
- Autowire RecruitmentRoundService

Endpoint 1: POST /jobs/{jobId}/rounds
  - @PathVariable Integer jobId
  - @RequestBody Map<String, Object> body
    — read roundName as (String) body.get("roundName")
    — read roundOrder as (Integer) body.get("roundOrder")
  - Calls roundService.createRound(jobId, roundName, roundOrder)
  - Returns 201 Created

Endpoint 2: GET /jobs/{jobId}/rounds
  - @PathVariable Integer jobId
  - Calls roundService.getRoundsForJob(jobId)
  - Returns 200 OK

Endpoint 3: PUT /applications/{applicationId}/round-result
  - @PathVariable Integer applicationId
  - @RequestBody Map<String, Object> body
    — read roundId as (Integer) body.get("roundId")
    — read status as (String) body.get("status")
  - Calls roundService.updateRoundResult(applicationId, roundId, status)
  - Returns 200 OK

- All return types are ResponseEntity<?>
```

**What the final file should look like:**
```java
package com.pat.backend_pat.controller;

import com.pat.backend_pat.service.RecruitmentRoundService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.Map;

@RestController
@RequestMapping("/api/v1")
public class RecruitmentRoundController {

    @Autowired
    private RecruitmentRoundService roundService;

    @PostMapping("/jobs/{jobId}/rounds")
    public ResponseEntity<?> createRound(
        @PathVariable Integer jobId,
        @RequestBody Map<String, Object> body
    ) {
        String roundName  = (String)  body.get("roundName");
        Integer roundOrder = (Integer) body.get("roundOrder");
        return ResponseEntity.status(201)
            .body(roundService.createRound(jobId, roundName, roundOrder));
    }

    @GetMapping("/jobs/{jobId}/rounds")
    public ResponseEntity<?> getRounds(@PathVariable Integer jobId) {
        return ResponseEntity.ok(roundService.getRoundsForJob(jobId));
    }

    @PutMapping("/applications/{applicationId}/round-result")
    public ResponseEntity<?> updateRoundResult(
        @PathVariable Integer applicationId,
        @RequestBody Map<String, Object> body
    ) {
        Integer roundId = (Integer) body.get("roundId");
        String status   = (String)  body.get("status");
        return ResponseEntity.ok(
            roundService.updateRoundResult(applicationId, roundId, status));
    }
}
```

**How to verify your files are correct:**
- Run `mvn spring-boot:run` — must start cleanly
- Do not test in browser yet — wait for Fahim's Postman suite

## Git Instructions (Aishwarya D S)
```bash
git add backend_pat
git commit -m "feat: add RecruitmentRoundService and RecruitmentRoundController"
git push origin dev
```
Message in group: **"RecruitmentRoundService + Controller pushed ✅"**

---
---

# 👤 B S AISHWARYA — Notification.java + NotificationRepository.java + NotificationService.java

## No Dependencies — Start Immediately

---

## Your Task
Three files — the notification entity, its repository, and the service. This is a self-contained module. The service is called by `RecruitmentRoundService` whenever a round result is updated.

## What are Notifications? (Read before coding)
Every time an employer updates a candidate's round result, the system creates a `Notification` row in the database linked to that student's user account. The student can then fetch their notifications via `GET /notifications` and mark them as read. Think of it like an inbox — each notification has a message, a read/unread flag, and a timestamp.

---

## File 1 — `Notification.java`

**Where to create it:**
`src/main/java/com/pat/backend_pat/entity/Notification.java`

**What this file does:**
Maps to the `notifications` table. Each row is one notification for one user.

**Approach to write this with AI:**
```
I am building a Spring Boot REST API.
Create a JPA entity class called Notification
inside package com.pat.backend_pat.entity

Requirements:
- Annotations: @Entity, @Table(name = "notifications"), @Data, @NoArgsConstructor
- Fields:
    Integer notificationId → @Id @GeneratedValue IDENTITY, @Column("notification_id")
    User user              → @ManyToOne @JoinColumn("user_id", nullable = false)
    String message         → @Column(columnDefinition = "TEXT", nullable = false)
    Boolean isRead         → @Column("is_read", nullable = false), default = false
    LocalDateTime createdAt → @Column("created_at", nullable = false),
                              default = LocalDateTime.now()
- Use Jakarta persistence imports
- Use Lombok imports
```

**What the final file should look like:**
```java
package com.pat.backend_pat.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "notifications")
@Data
@NoArgsConstructor
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "notification_id")
    private Integer notificationId;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(name = "is_read", nullable = false)
    private Boolean isRead = false;

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}
```

**How to verify your file is correct:**
- Run `mvn spring-boot:run` — a new `notifications` table must appear in MySQL

---

## File 2 — `NotificationRepository.java`

**Where to create it:**
`src/main/java/com/pat/backend_pat/repository/NotificationRepository.java`

**What this file does:**
Standard JPA repository plus one custom method that returns all notifications for a user sorted newest first.

**Approach to write this with AI:**
```
I am building a Spring Boot REST API.
Create a JPA repository interface called NotificationRepository
inside package com.pat.backend_pat.repository

Requirements:
- Extend JpaRepository<Notification, Integer>
- Add method: List<Notification> findByUserOrderByCreatedAtDesc(User user)
  — returns all notifications for a user, newest first
- Correct imports: JpaRepository, Notification, User, List
```

**What the final file should look like:**
```java
package com.pat.backend_pat.repository;

import com.pat.backend_pat.entity.Notification;
import com.pat.backend_pat.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface NotificationRepository extends JpaRepository<Notification, Integer> {

    List<Notification> findByUserOrderByCreatedAtDesc(User user);
}
```

---

## File 3 — `NotificationService.java`

**Where to create it:**
`src/main/java/com/pat/backend_pat/service/NotificationService.java`

**What this file does:**
Three methods — create a notification, get all notifications for a user, mark one as read.

**Approach to write this with AI:**
```
I am building a Spring Boot REST API.
Create a Spring service class called NotificationService
inside package com.pat.backend_pat.service

Requirements:
- Annotate with @Service
- Autowire: UserRepository, NotificationRepository

Method 1 — createNotification(Integer userId, String message):
  - Find user using userRepository.findById(userId)
    — throw RuntimeException("User not found") if absent
  - Create new Notification, set user and message (isRead defaults to false)
  - Save and return the notification

Method 2 — getNotifications(Integer userId):
  - Find user using userRepository.findById(userId)
    — throw RuntimeException("User not found") if absent
  - Return notificationRepository.findByUserOrderByCreatedAtDesc(user)
  - Return type: List<Notification>

Method 3 — markAsRead(Integer notificationId):
  - Find notification using notificationRepository.findById(notificationId)
    — throw RuntimeException("Notification not found") if absent
  - Set notification.setIsRead(true)
  - Save and return the updated notification
```

**What the final file should look like:**
```java
package com.pat.backend_pat.service;

import com.pat.backend_pat.entity.Notification;
import com.pat.backend_pat.entity.User;
import com.pat.backend_pat.repository.NotificationRepository;
import com.pat.backend_pat.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NotificationService {

    @Autowired private UserRepository userRepository;
    @Autowired private NotificationRepository notificationRepository;

    public Notification createNotification(Integer userId, String message) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setMessage(message);
        return notificationRepository.save(notification);
    }

    public List<Notification> getNotifications(Integer userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return notificationRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public Notification markAsRead(Integer notificationId) {
        Notification notification = notificationRepository.findById(notificationId)
            .orElseThrow(() -> new RuntimeException("Notification not found"));
        notification.setIsRead(true);
        return notificationRepository.save(notification);
    }
}
```

**How to verify your file is correct:**
- `UserRepository` was built in Phase 1 — confirm it extends `JpaRepository<User, Integer>` with `Integer` not `Long`
- Run `mvn spring-boot:run` — must start cleanly

## Git Instructions (B S Aishwarya)
```bash
git add backend_pat
git commit -m "feat: add Notification entity, NotificationRepository, NotificationService"
git push origin dev
```
Message in group: **"Notification entity + repo + service pushed ✅"**

---
---

# 👤 MANOJ — NotificationController.java + update ApplicationService.java

## ⚠️ WAIT BEFORE STARTING
**Do not start until B S Aishwarya pushes `NotificationService.java` and you have pulled:**
```bash
git pull origin dev
```
Confirm you can see `service/NotificationService.java` before proceeding.

---

## Your Task
Two things — a new controller for notification endpoints, and a small but important update to `ApplicationService.java` so it triggers a notification when a student successfully applies for a job.

---

## File 1 — `NotificationController.java`

**Where to create it:**
`src/main/java/com/pat/backend_pat/controller/NotificationController.java`

**What this file does:**
Two endpoints — get all notifications for the logged-in user, and mark one notification as read.

**Approach to write this with AI:**
```
I am building a Spring Boot REST API.
Create a REST controller class called NotificationController
inside package com.pat.backend_pat.controller

Requirements:
- Annotate with @RestController and @RequestMapping("/api/v1")
- Autowire NotificationService

Endpoint 1: GET /notifications
  - Takes Authentication auth
  - Gets userId as (Integer) auth.getDetails()
  - Calls notificationService.getNotifications(userId)
  - Returns 200 OK with the list

Endpoint 2: PUT /notifications/{notificationId}/read
  - @PathVariable Integer notificationId
  - Calls notificationService.markAsRead(notificationId)
  - Returns 200 OK with the updated notification

- All return types are ResponseEntity<?>
```

**What the final file should look like:**
```java
package com.pat.backend_pat.controller;

import com.pat.backend_pat.service.NotificationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping("/notifications")
    public ResponseEntity<?> getNotifications(Authentication auth) {
        Integer userId = (Integer) auth.getDetails();
        return ResponseEntity.ok(notificationService.getNotifications(userId));
    }

    @PutMapping("/notifications/{notificationId}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Integer notificationId) {
        return ResponseEntity.ok(notificationService.markAsRead(notificationId));
    }
}
```

---

## File 2 — Update `ApplicationService.java`

**What to add:**
Open your existing `ApplicationService.java`. Add one notification trigger inside `applyForJob()` — after the application is saved successfully. Do not touch anything else.

**Approach to write this with AI:**
```
I have an existing Spring Boot ApplicationService.java.
I need to add a notification trigger inside the applyForJob() method.

Steps:
1. Autowire NotificationService into the class:
   @Autowired private NotificationService notificationService;

2. Inside applyForJob(), after the line:
   return applicationRepository.save(application);
   
   Add a notification call BEFORE the return statement:
   notificationService.createNotification(
       userId,
       "Your application for '" + job.getJobTitle() +
       "' at " + job.getEmployer().getCompanyName() +
       " has been submitted successfully."
   );

Do not change any other logic. Only add the autowire field
and the notification call. Show me only those two additions.
```

**Add this autowired field:**
```java
@Autowired private NotificationService notificationService;
```

**Add this call inside `applyForJob()` before the return statement:**
```java
notificationService.createNotification(
    userId,
    "Your application for '" + job.getJobTitle() +
    "' at " + job.getEmployer().getCompanyName() +
    " has been submitted successfully."
);
```

**How to verify your files are correct:**
- Run `mvn spring-boot:run` — must start cleanly
- No hardcoded user IDs anywhere

## Git Instructions (Manoj)
```bash
git add backend_pat
git commit -m "feat: add NotificationController, trigger notification on job apply"
git push origin dev
```
Message in group: **"NotificationController + ApplicationService notification trigger pushed ✅"**

---
---

# 👤 Kundan — NotificationBell.jsx + RoundsManagerPage.jsx

## No Dependencies — Start Immediately on UI Structure

> **Note on wiring:** Build the UI structure now using placeholder data. Wire the real API calls after Fahim confirms the backend Postman tests pass. This way you are not blocked.

---

## New API exports needed in `api.js`

Add all of these before building the components:

```javascript
// ── Notifications ─────────────────────────────────────────────
export const getNotifications = () => api.get("/notifications");
export const markNotificationRead = (id) => api.put(`/notifications/${id}/read`);

// ── Recruitment Rounds ────────────────────────────────────────
export const createRound = (jobId, data) => api.post(`/jobs/${jobId}/rounds`, data);
export const getJobRounds = (jobId) => api.get(`/jobs/${jobId}/rounds`);
export const updateRoundResult = (applicationId, data) =>
  api.put(`/applications/${applicationId}/round-result`, data);
```

---

## Component 1 — `NotificationBell.jsx`

**Where to create it:**
`src/components/NotificationBell/NotificationBell.jsx`

**What this component does:**
A bell icon shown in the navbar or dashboard header. Fetches notifications on load. Shows a red badge with the count of unread notifications. Clicking the bell opens a dropdown list of messages. Clicking a notification marks it as read.

**Approach to write this with AI:**
```
Create a React component called NotificationBell at
src/components/NotificationBell/NotificationBell.jsx.

Requirements:
- Import getNotifications and markNotificationRead from ../../services/api
- On mount: call getNotifications() and store in state
- Compute unreadCount: filter notifications where isRead === false
- Show a bell icon (use the 🔔 emoji or any icon)
- If unreadCount > 0: show a small red circular badge with the count
  overlaid on the bell icon
- Clicking the bell toggles a dropdown open/closed
- Dropdown shows each notification as a row with:
    - The message text
    - The createdAt date formatted readably
    - If isRead is false: show with bold text or a blue left border
    - If isRead is true: show with normal/muted text
- Clicking a notification row:
    - Calls markNotificationRead(notification.notificationId)
    - Updates that notification's isRead to true in local state
      (do not re-fetch the entire list — just update the one item)
- Show "No notifications yet." if array is empty
- Use same inline styling as ProfilePage.jsx
```

---

## Page 1 — `RoundsManagerPage.jsx`

**Where to create it:**
`src/pages/RoundsManagerPage/RoundsManagerPage.jsx`

**What this page does:**
Employer-facing page. Shows all rounds for a selected job. Allows adding new rounds. For each round, shows the list of applicants with Pass / Fail / Pending buttons.

**Approach to write this with AI:**
```
Create a React component called RoundsManagerPage at
src/pages/RoundsManagerPage/RoundsManagerPage.jsx.

Requirements:
- Use useParams from react-router-dom to read jobId from URL
- On mount: call getJobRounds(jobId) and getJobApplicants(jobId)
  — store both in state
- Section 1 — Add New Round:
    - Text input for roundName
    - Number input for roundOrder (min=1)
    - "Add Round" button that calls createRound(jobId, { roundName, roundOrder })
    - On success: refresh rounds list and clear inputs
    - On error: show red toast with the error message
      (e.g. "A round with order 1 already exists")
- Section 2 — Rounds List:
    - Show each round as a card: round name and order number
    - Under each round card, show all applicants as rows with:
        - Student name (app.student.fullName)
        - Three buttons: "Pass", "Fail", "Pending"
        - Clicking a button calls updateRoundResult(app.applicationId,
          { roundId: round.roundId, status: "Passed" / "Failed" / "Pending" })
        - On success: show green toast "Result updated"
        - Highlight the currently active status button
- Use DashboardLayout as wrapper
- Use same inline styling as ProfilePage.jsx
```

## Git Instructions (FE-1)
```bash
git add pat-frontend
git commit -m "feat: add NotificationBell component and RoundsManagerPage"
git push origin dev
```
Message in group: **"NotificationBell + RoundsManagerPage pushed ✅"**

---
---

# 👤 Dinesh — AdminDashboard.jsx + ManageEmployersPage.jsx + ManageStudentsPage.jsx + StatCard.jsx

## No Dependencies — Start Immediately

---

## New API exports needed in `api.js`

Add these before building the pages:

```javascript
// ── Admin ─────────────────────────────────────────────────────
export const getAdminStudents   = () => api.get("/admin/students");
export const getAdminEmployers  = () => api.get("/admin/employers");
export const approveEmployer    = (id) => api.put(`/admin/employers/${id}/approve`);
export const removeEmployer     = (id) => api.delete(`/admin/employers/${id}`);
export const getAdminStatistics = () => api.get("/admin/statistics");
```

---

## Component 1 — `StatCard.jsx`

**Where to create it:**
`src/components/StatCard/StatCard.jsx`

**What this component does:**
A reusable card that displays a single statistic. Used across AdminDashboard. Takes a label and value as props.

**Approach to write this with AI:**
```
Create a reusable React component called StatCard at
src/components/StatCard/StatCard.jsx.

Props:
- label (string) — e.g. "Total Students"
- value (number) — e.g. 42
- color (string, optional) — a hex color for the card accent,
  defaults to "#4c7ef0" if not provided

Requirements:
- Show the value prominently (large bold number)
- Show the label below it in smaller text
- Apply the color as a left border or top border accent on the card
- Card has white background, light shadow, rounded corners
- Use same inline styling as ProfilePage.jsx — no external UI libraries
```

---

## Page 1 — `AdminDashboard.jsx`

**Where to create it:**
`src/pages/AdminDashboard/AdminDashboard.jsx`

**Approach to write this with AI:**
```
Create a React component called AdminDashboard at
src/pages/AdminDashboard/AdminDashboard.jsx.

Requirements:
- Import getAdminStatistics from ../../services/api
- Import StatCard from ../../components/StatCard/StatCard
- On mount: call getAdminStatistics() and store in state
- Show a heading: "Admin Dashboard"
- Show 5 StatCards in a row:
    - "Total Students"     → stats.totalStudents
    - "Total Employers"    → stats.totalEmployers
    - "Total Jobs"         → stats.totalJobs
    - "Total Applications" → stats.totalApplications
    - "Total Selected"     → stats.totalSelected
- Show two navigation buttons below the stat cards:
    - "Manage Employers" → navigates to /admin/employers
    - "View Students"    → navigates to /admin/students
- Use DashboardLayout as wrapper
- Use same inline styling as ProfilePage.jsx
```

---

## Page 2 — `ManageEmployersPage.jsx`

**Where to create it:**
`src/pages/ManageEmployersPage/ManageEmployersPage.jsx`

**What this page does:**
Shows all registered employers. Pending employers (not yet approved) have an Approve button. Any employer can be removed. This is the most important page in Phase 4 — it unblocks the full browser flow.

**Approach to write this with AI:**
```
Create a React component called ManageEmployersPage at
src/pages/ManageEmployersPage/ManageEmployersPage.jsx.

Requirements:
- Import getAdminEmployers, approveEmployer, removeEmployer from ../../services/api
- On mount: call getAdminEmployers() and store in state
- Show each employer as a table row with:
    - Company name (employer.companyName)
    - Email (employer.user.email)
    - Status badge:
        approvedStatus === true  → green badge "Approved"
        approvedStatus === false → orange badge "Pending"
    - "Approve" button — only visible if approvedStatus is false
        On click: call approveEmployer(employer.employerId)
        On success: update that employer's approvedStatus to true
          in local state (do not re-fetch the whole list)
        Show green toast: "Employer approved successfully"
    - "Remove" button — always visible
        On click: call removeEmployer(employer.employerId)
        On success: remove that employer from the local state array
        Show red toast: "Employer removed"
- Show "No employers registered yet." if array is empty
- Use DashboardLayout as wrapper
- Use same inline styling as ProfilePage.jsx
```

---

## Page 3 — `ManageStudentsPage.jsx`

**Where to create it:**
`src/pages/ManageStudentsPage/ManageStudentsPage.jsx`

**Approach to write this with AI:**
```
Create a React component called ManageStudentsPage at
src/pages/ManageStudentsPage/ManageStudentsPage.jsx.

Requirements:
- Import getAdminStudents from ../../services/api
- On mount: call getAdminStudents() and store in state
- Show a read-only table with columns:
    Full Name      → student.fullName
    USN            → student.usn
    Branch         → student.branch
    CGPA           → student.cgpa
    Passing Year   → student.passingYear
- No action buttons — this page is read-only
- Show "No students registered yet." if array is empty
- Use DashboardLayout as wrapper
- Use same inline styling as ProfilePage.jsx
```

## Git Instructions (FE-2)
```bash
git add pat-frontend
git commit -m "feat: add AdminDashboard, ManageEmployersPage, ManageStudentsPage, StatCard"
git push origin dev
```
Message in group: **"Admin pages + StatCard pushed ✅"**

---
---

# 👤 Narasimha — AppRoutes.jsx Phase 4 routes + api.js audit + Admin redirect + NotificationBell in layout

## No Dependencies — Start Immediately

---

## Task 1 — Add Phase 4 routes to `AppRoutes.jsx`

Open `src/routes/AppRoutes.jsx`. Inside the protected route block, add these new routes:

```jsx
{/* Admin routes */}
<Route path="/admin/dashboard" element={<AdminDashboard />} />
<Route path="/admin/employers" element={<ManageEmployersPage />} />
<Route path="/admin/students" element={<ManageStudentsPage />} />

{/* Employer routes — add to existing employer block */}
<Route path="/employer/jobs/:jobId/rounds" element={<RoundsManagerPage />} />
```

Add imports for all 4 new components at the top of `AppRoutes.jsx`. Use the same import pattern as existing pages.

---

## Task 2 — Admin redirect after login

Open `LoginPage.jsx`. Update the navigation logic so admin users land on their dashboard:

```javascript
// Update the existing role-based navigation:
if (role === "student")  navigate("/dashboard");
if (role === "employer") navigate("/employer/dashboard");
if (role === "admin")    navigate("/admin/dashboard");   // ← update this line
```

---

## Task 3 — Add NotificationBell to DashboardLayout

Open `DashboardLayout` (wherever it is defined — likely `src/layouts/DashboardLayout.jsx`). Import `NotificationBell` and add it to the header/navbar area:

**Approach to write this with AI:**
```
I have an existing DashboardLayout.jsx component that wraps
all dashboard pages with a header and sidebar/nav.

I need to add the NotificationBell component to the header area.

Steps:
1. Import NotificationBell from ../components/NotificationBell/NotificationBell
2. Add <NotificationBell /> in the top-right area of the header
   — place it before or after the Logout button, whichever looks better

Show me only the import line and where to place the component.
Do not change anything else in the layout.
```

---

## Task 4 — Add Rounds Manager link to Employer Dashboard

Open `EmployerDashboard.jsx`. Each job row currently has a "View Applicants" button. Add a second button next to it:

```jsx
// Add this button next to the existing "View Applicants" button in each job row:
<button onClick={() => navigate(`/employer/jobs/${job.jobId}/rounds`)}>
  Manage Rounds
</button>
```

---

## Task 5 — Audit `api.js` for duplicate exports

By end of Phase 4, multiple people will have added exports to `api.js`. Open the file and scan for duplicate export names. If you find any — **do not fix it yourself** — message Fahim and he will coordinate.

**How to verify your work is correct:**
- Login as admin → must land on `/admin/dashboard`
- `/admin/employers` must load ManageEmployersPage
- `/admin/students` must load ManageStudentsPage
- `/employer/jobs/:jobId/rounds` must load RoundsManagerPage
- NotificationBell must appear in the header on every dashboard page

## Git Instructions (FE-3)
```bash
git add pat-frontend
git commit -m "feat: add Phase 4 routes, admin redirect, NotificationBell in layout"
git push origin dev
```
Message in group: **"Phase 4 routes + admin redirect + NotificationBell in layout pushed ✅"**

---
---

## 📌 End of Phase 4 — Definition of Done

Confirm all of these to Fahim before Phase 4 is marked complete:

**Backend:**
- [ ] `dto/StatisticsDTO.java` exists with 5 int fields
- [ ] `service/AdminService.java` has all 5 methods including `approveEmployer()`
- [ ] `controller/AdminController.java` has all 5 endpoints
- [ ] `repository/ApplicationRepository.java` has `countByStatus(String status)` added
- [ ] `SecurityConfig.java` restricts `/api/v1/admin/**` to ADMIN role only
- [ ] `entity/RecruitmentRound.java` exists with correct `@ManyToOne` to `Job`
- [ ] `repository/RecruitmentRoundRepository.java` has `findByJobOrderByRoundOrderAsc()` and `existsByJobAndRoundOrder()`
- [ ] `entity/RoundResult.java` exists with `@ManyToOne` to `Application` and `RecruitmentRound`
- [ ] `repository/RoundResultRepository.java` has `findByApplicationAndRound()`
- [ ] `service/RecruitmentRoundService.java` has all 3 methods with duplicate order check
- [ ] `controller/RecruitmentRoundController.java` has all 3 endpoints
- [ ] `entity/Notification.java` exists with `@ManyToOne` to `User`
- [ ] `repository/NotificationRepository.java` has `findByUserOrderByCreatedAtDesc()`
- [ ] `service/NotificationService.java` has `createNotification()`, `getNotifications()`, `markAsRead()`
- [ ] `controller/NotificationController.java` has `GET /notifications` and `PUT /notifications/{id}/read`
- [ ] `ApplicationService.java` triggers a notification on successful job application
- [ ] `RecruitmentRoundService.java` triggers a notification on round result update
- [ ] All 15 Postman tests pass — Fahim sends screenshot to group

**Frontend:**
- [ ] `StatCard.jsx` component renders label and value with color accent
- [ ] `AdminDashboard.jsx` shows 5 StatCards with real data from `GET /admin/statistics`
- [ ] `ManageEmployersPage.jsx` shows all employers, Approve button updates status in-place, Remove works
- [ ] `ManageStudentsPage.jsx` shows read-only student table
- [ ] `NotificationBell.jsx` shows unread count badge, dropdown opens, clicking marks as read
- [ ] `RoundsManagerPage.jsx` creates rounds, shows applicants, Pass/Fail/Pending buttons work
- [ ] `AppRoutes.jsx` has all 4 new routes defined
- [ ] Admin login redirects to `/admin/dashboard`
- [ ] `DashboardLayout` shows `NotificationBell` in the header
- [ ] Employer Dashboard has "Manage Rounds" button next to each job row

**End-to-End Browser Flow (run this in order after Fahim confirms backend is ready):**
- [ ] Register a new employer account via `/register`
- [ ] Login as admin → go to Manage Employers → click Approve on the new employer
- [ ] Login as the employer → post a new job
- [ ] Login as a student → browse jobs → apply for the new job
- [ ] Student checks notifications — sees "application submitted" notification
- [ ] Login as employer → Manage Rounds → add Round 1 for the job
- [ ] Employer marks the student as Passed in Round 1
- [ ] Student checks notifications — sees round result notification with unread badge
- [ ] Student clicks notification — badge count decreases, notification marked as read

> **Only when ALL 15 backend Postman tests pass AND the full end-to-end browser flow above works without errors — message the mentor with results. We will then confirm Phase 4 is complete and move to Phase 5 (Integration, CORS polish, Analytics, UI polish, and Demo Prep).**
