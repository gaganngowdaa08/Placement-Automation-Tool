# Placement Automation Tool (PAT)

## Database Schema

This document defines the relational database schema for the Placement Automation Tool (PAT).
The ER diagram is the single source of truth. All tables, fields, and relationships reflect the actual implemented SQL schema.

---

# 1. Users

Stores authentication credentials for all system users.

| Field               | Type                                | Constraints        | Description                        |
|---------------------|-------------------------------------|--------------------|------------------------------------|
| user_id             | INT                                 | PK, AUTO_INCREMENT | Unique user identifier             |
| email               | VARCHAR                             | NOT NULL, UNIQUE   | User email address                 |
| password_hash       | VARCHAR                             | NOT NULL           | Hashed password                    |
| role                | ENUM('student', 'employer', 'admin')| NOT NULL           | User role                          |
| created_at          | TIMESTAMP                           | NOT NULL           | Account creation time              |
| reset_token         | VARCHAR                             | NULL               | Token for password reset           |
| reset_token_expiry  | DATETIME                            | NULL               | Expiry timestamp for reset token   |

### Notes
- `reset_token` and `reset_token_expiry` are set when a forgot-password request is made and cleared after successful reset.
- All IDs in this system are INT-based with AUTO_INCREMENT. No UUIDs are used.

---

# 2. Students

Stores student profile information.

| Field             | Type               | Constraints              | Description             |
|-------------------|--------------------|--------------------------|-------------------------|
| student_id        | INT                | PK, AUTO_INCREMENT       | Unique student ID       |
| user_id           | INT                | NOT NULL, FK → users     | Linked user account     |
| full_name         | VARCHAR            | NULL                     | Student full name       |
| phone_number      | VARCHAR            | NULL                     | Contact number          |
| usn               | VARCHAR            | NULL, UNIQUE             | University Seat Number  |
| branch            | VARCHAR            | NULL                     | Department / Branch     |
| cgpa              | DECIMAL            | NULL                     | Current CGPA            |
| backlog_count     | INT                | NULL                     | Number of backlogs      |
| passing_year      | INT                | NULL                     | Graduation year         |
| skills            | TEXT               | NULL                     | Skills list             |
| projects          | TEXT               | NULL                     | Projects description    |
| linkedin_url      | VARCHAR            | NULL                     | LinkedIn profile URL    |
| github_url        | VARCHAR            | NULL                     | GitHub profile URL      |
| profile_completed | BOOLEAN            | NOT NULL, DEFAULT FALSE  | Profile completion flag |

---

# 3. Student Academic

Stores academic background details for a student. Each student has exactly one academic record.

| Field           | Type    | Constraints              | Description                          |
|-----------------|---------|--------------------------|--------------------------------------|
| academic_id     | INT     | PK, AUTO_INCREMENT       | Unique academic record ID            |
| student_id      | INT     | NOT NULL, FK → students  | Linked student                       |
| degree          | VARCHAR | NULL                     | Degree name                          |
| tenth           | DOUBLE  | NULL                     | 10th grade percentage/score          |
| twelfth         | DOUBLE  | NULL                     | 12th grade percentage/score          |
| semester        | INT     | NULL                     | Current semester                     |
| certifications  | TEXT    | NULL                     | Certifications list                  |

### Notes
- Relationship with students is 1:1.
- This table was added to separate academic history from the core student profile.

---

# 4. Employers

Stores company recruiter information.

| Field               | Type    | Constraints              | Description                        |
|---------------------|---------|--------------------------|------------------------------------|
| employer_id         | INT     | PK, AUTO_INCREMENT       | Unique employer ID                 |
| user_id             | INT     | NOT NULL, FK → users     | Linked user account                |
| company_name        | VARCHAR | NOT NULL                 | Company name                       |
| company_description | TEXT    | NULL                     | Description of the company         |
| approved_status     | BOOLEAN | NOT NULL, DEFAULT FALSE  | Whether admin has approved         |
| created_at          | TIMESTAMP | NOT NULL               | Registration timestamp             |

### Notes
- An employer cannot post jobs until `approved_status = TRUE`.

---

# 5. Jobs

Stores job postings created by employers.

| Field                | Type                              | Constraints                        | Description                    |
|----------------------|-----------------------------------|------------------------------------|--------------------------------|
| job_id               | INT                               | PK, AUTO_INCREMENT                 | Unique job ID                  |
| employer_id          | INT                               | NOT NULL, FK → employers           | Employer who posted the job    |
| job_title            | VARCHAR(255)                      | NOT NULL                           | Job role title                 |
| job_description      | TEXT                              | NULL                               | Job details                    |
| salary_package       | VARCHAR(100)                      | NOT NULL                           | Offered salary                 |
| job_location         | VARCHAR(100)                      | NULL                               | Job location                   |
| min_cgpa             | DECIMAL(3,2)                      | NULL                               | Minimum CGPA requirement       |
| eligible_branches    | TEXT                              | NULL                               | Allowed branches/departments   |
| max_backlogs         | INT                               | NULL                               | Maximum allowed backlogs       |
| passing_year         | INT                               | NULL                               | Required graduation year       |
| application_deadline | DATE                              | NOT NULL                           | Last date to apply             |
| placement_drive_date | DATE                              | NOT NULL                           | Date of placement drive        |
| created_at           | TIMESTAMP                         | NOT NULL                           | Job creation timestamp         |
| status               | ENUM('OPEN', 'CLOSED', 'DELETED') | NOT NULL, DEFAULT 'OPEN'           | Current job status             |

### Job Status Lifecycle

| Status    | Meaning                                    |
|-----------|--------------------------------------------|
| OPEN      | Job is accepting applications              |
| CLOSED    | Intake stopped; no new applications        |
| DELETED   | Job posting removed from the system        |

### Notes
- Only `OPEN` jobs are returned to students in job listings and dashboard stats.
- Eligibility fields (`min_cgpa`, `eligible_branches`, `max_backlogs`, `passing_year`) are optional. NULL means no restriction for that criterion.

---

# 6. Resumes

Stores resume metadata for students. The actual PDF file is stored on the server filesystem, not in the database.

| Field       | Type      | Constraints              | Description                                  |
|-------------|-----------|--------------------------|----------------------------------------------|
| resume_id   | INT       | PK, AUTO_INCREMENT       | Unique resume ID                             |
| student_id  | INT       | NOT NULL, FK → students  | Owning student                               |
| resume_file | TEXT      | NOT NULL                 | Server-accessible path to the PDF file       |
| file_name   | VARCHAR   | NULL                     | Original uploaded filename                   |
| uploaded_at | TIMESTAMP | NOT NULL                 | Upload timestamp                             |
| is_default  | BOOLEAN   | NOT NULL, DEFAULT FALSE  | Whether this is the student's default resume |

### Resume Storage Architecture

- The frontend sends the PDF file as a `multipart/form-data` request.
- The backend validates the file (PDF only, max 1MB) and stores it on the server filesystem.
- Storage path pattern: `uploads/resumes/{userId}.pdf`
- `resume_file` stores the server-accessible URL path, for example: `/uploads/resumes/5.pdf`
- The database does **not** store the file binary.

### Resume Business Logic

- **Profile resume:** One resume per student. Uploading a new resume overwrites the existing file at the same path.
- **Application resume:** When applying for a job, a student may optionally upload a custom resume. If no custom resume is uploaded, the system falls back to the student's default profile resume.

### Employer Access

Employers can view an applicant's resume by navigating to the stored URL:
http://localhost:8080/uploads/resumes/{userId}.pdf

The browser renders the PDF directly.

---

# 7. Applications

Stores job applications submitted by students.

| Field          | Type                                                                                   | Constraints                     | Description                    |
|----------------|----------------------------------------------------------------------------------------|---------------------------------|--------------------------------|
| application_id | INT                                                                                    | PK, AUTO_INCREMENT              | Unique application ID          |
| student_id     | INT                                                                                    | NOT NULL, FK → students         | Applicant                      |
| job_id         | INT                                                                                    | NOT NULL, FK → jobs             | Job applied for                |
| resume_id      | INT                                                                                    | NOT NULL, FK → resumes          | Resume used for this application |
| status         | ENUM('Applied','Shortlisted','Round1_Cleared','Round2_Cleared','Selected','Rejected')  | NOT NULL, DEFAULT 'Applied'     | Current application status     |
| applied_at     | TIMESTAMP                                                                              | NOT NULL                        | Application timestamp          |

### Application Status Values

| Status          | Meaning                              |
|-----------------|--------------------------------------|
| Applied         | Application submitted                |
| Shortlisted     | Student moved to shortlist           |
| Round1_Cleared  | Cleared first recruitment round      |
| Round2_Cleared  | Cleared second recruitment round     |
| Selected        | Final selection                      |
| Rejected        | Application rejected                 |

### Uniqueness Constraint
- A student can apply for a given job only once. The combination of `(student_id, job_id)` is unique.

---

# 8. Recruitment Rounds

Defines recruitment stages for a job posting.

| Field       | Type      | Constraints              | Description                        |
|-------------|-----------|--------------------------|------------------------------------|
| round_id    | INT       | PK, AUTO_INCREMENT       | Unique round ID                    |
| job_id      | INT       | NOT NULL, FK → jobs      | Associated job                     |
| round_name  | VARCHAR   | NOT NULL                 | Name of the round (e.g. "HR")      |
| round_order | INT       | NOT NULL                 | Sequential order of the round      |
| created_at  | TIMESTAMP | NOT NULL                 | Round creation timestamp           |

### Notes
- `round_order` must be unique per job and must follow sequential ordering.

---

# 9. Round Results

Tracks each student's outcome per recruitment round.

| Field          | Type                            | Constraints                       | Description               |
|----------------|---------------------------------|-----------------------------------|---------------------------|
| result_id      | INT                             | PK, AUTO_INCREMENT                | Unique result ID          |
| application_id | INT                             | NOT NULL, FK → applications       | Associated application    |
| round_id       | INT                             | NOT NULL, FK → recruitment_rounds | Associated round          |
| status         | ENUM('Passed', 'Failed', 'Pending') | NOT NULL, DEFAULT 'Pending'   | Outcome of the round      |
| updated_at     | TIMESTAMP                       | NOT NULL                          | Last update timestamp     |

---

# 10. Notifications

Stores system notifications for users.

| Field           | Type      | Constraints              | Description              |
|-----------------|-----------|--------------------------|--------------------------|
| notification_id | INT       | PK, AUTO_INCREMENT       | Unique notification ID   |
| user_id         | INT       | NOT NULL, FK → users     | Target user              |
| message         | TEXT      | NOT NULL                 | Notification message     |
| is_read         | BOOLEAN   | NOT NULL, DEFAULT FALSE  | Read/unread status       |
| created_at      | TIMESTAMP | NOT NULL                 | Creation timestamp       |

### Notes
- Notifications are fetched on-demand via REST API. There is no real-time push mechanism (no WebSocket or SSE).
- Triggers: job creation, application status updates, round result updates.

---

# 11. Student Analytics

Stores precomputed placement analytics per student.

| Field              | Type | Constraints              | Description                     |
|--------------------|------|--------------------------|---------------------------------|
| student_id         | INT  | PK, FK → students        | Student (also serves as PK)     |
| applications_count | INT  | NOT NULL, DEFAULT 0      | Total applications submitted    |
| shortlisted_count  | INT  | NOT NULL, DEFAULT 0      | Times shortlisted               |
| interviews_given   | INT  | NOT NULL, DEFAULT 0      | Interviews attended             |

---

# Entity Relationships

| Relationship                          | Type |
|---------------------------------------|------|
| users → students                      | 1:1  |
| users → employers                     | 1:1  |
| students → student_academic           | 1:1  |
| employers → jobs                      | 1:N  |
| students → resumes                    | 1:N  |
| students → applications               | 1:N  |
| jobs → applications                   | 1:N  |
| jobs → recruitment_rounds             | 1:N  |
| applications → round_results          | 1:N  |
| recruitment_rounds → round_results    | 1:N  |
| users → notifications                 | 1:N  |
| students → student_analytics          | 1:1  |
