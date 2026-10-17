# Placement Automation Tool (PAT)

## Software Requirements Specification (SRS)

---

# 1. Introduction

## 1.1 Purpose

This document describes the functional and non-functional requirements of the Placement Automation Tool (PAT). It serves as a reference for developers, stakeholders, and reviewers, and as a base for academic and professional documentation.

## 1.2 Scope

PAT manages the end-to-end campus recruitment lifecycle within a college. It provides a centralized platform for students, employers, and college administrators.

- Students create profiles, upload resumes, and apply for jobs
- Employers post job opportunities and manage recruitment rounds
- Admins monitor and control all placement activities

The system enforces strict validation and eligibility rules at the API level before any database operation.

## 1.3 Definitions

| Term      | Description                                  |
|-----------|----------------------------------------------|
| PAT       | Placement Automation Tool                    |
| Admin     | College placement cell administrator         |
| Employer  | Company recruiter                            |
| USN       | University Seat Number                       |
| Applicant | Student who has applied for a job            |
| JWT       | JSON Web Token, used for API authentication  |

---

# 2. Overall System Description

## 2.1 System Perspective

PAT replaces manual workflows involving spreadsheets, emails, and messaging groups. All data flows through validated API endpoints. Invalid operations are rejected before reaching the database.

## 2.2 Architecture

PAT is a 3-tier web application:

- **Frontend:** React.js (Vite, TailwindCSS, Axios)
- **Backend:** Spring Boot (Spring Security, Spring Data JPA, Hibernate, Spring Mail)
- **Database:** MySQL

Additional system components:
- JWT-based security layer (access token only, 24-hour expiry)
- Server filesystem-based resume storage
- SMTP-based password reset email service
- REST-based notification system (on-demand fetch)

## 2.3 Stakeholders

**Students:** register, build profiles, apply for jobs, track status, receive notifications

**Employers:** register, get approved, post and manage jobs, manage recruitment rounds, track applicants

**Admin:** approve employers, monitor the system, manage data integrity

---

# 3. Functional Requirements

## 3.1 User Authentication

- All users register with email, password, and role
- Login returns a JWT access token (24-hour expiry)
- No refresh tokens; after expiry the user must log in again
- JWT is validated on every protected request
- Roles: Student, Employer, Admin

## 3.2 Password Reset

- User submits their registered email
- System generates a `reset_token` and `reset_token_expiry`, persisted on the user record
- Reset link is sent to the user's email via SMTP (Spring Mail)
- User submits a new password with the token
- System validates token and expiry, updates password, clears token fields
- **Email is used only for password reset.** General notification emails are not implemented.

## 3.3 Student Profile

Students must complete their profile before applying for jobs.

**Core profile fields:**

- Full Name, Phone Number, Email, USN (mandatory), Branch, CGPA, Backlog Count, Passing Year, Skills, Projects, LinkedIn (optional), GitHub (optional)

**Academic details (separate record):**

- Degree, 10th score, 12th score, Current Semester, Certifications

## 3.4 Resume Management

- Students upload resumes in PDF format (max 1MB)
- File is stored on the server filesystem at `uploads/resumes/{userId}.pdf`
- Database stores only the file path, not the binary
- Uploading a new resume overwrites the previous file
- A resume must exist before a student can apply for a job

**Application resume logic:**
- When applying, the student may upload a custom resume
- If no custom resume is provided, the system falls back to the default profile resume

**Employer access:**
- Employers view applicant resumes via direct URL: `http://localhost:8080/uploads/resumes/{userId}.pdf`

## 3.5 Employer Registration and Approval

- Employer registers and submits company profile
- Account is created with `approved_status = false`
- Admin must approve the employer before they can post jobs
- Admin may also reject/remove employer accounts

## 3.6 Job Posting

### Required Fields

- Job Title, Salary Package, Application Deadline, Placement Drive Date

### Optional Fields

- Job Description, Job Location, Minimum CGPA, Eligible Branches, Maximum Backlogs, Passing Year

### Validation Rules

- Required fields must not be empty
- `application_deadline` must be a future date
- `placement_drive_date` ≥ `application_deadline`
- `min_cgpa` (if provided): 0–10
- `max_backlogs` (if provided): ≥ 0

### Job Status Lifecycle

| Status  | Meaning                                  |
|---------|------------------------------------------|
| OPEN    | Job is accepting applications            |
| CLOSED  | Intake stopped; no new applications      |
| DELETED | Job removed from student-facing listings |

- Jobs are created with status `OPEN`
- Employer can update status to `CLOSED` or `DELETED`
- Only `OPEN` jobs appear in student dashboards and job listings

## 3.7 Eligibility Filtering

- Eligibility criteria are applied only if provided; NULL fields are ignored
- Checks: CGPA ≥ min_cgpa, branch in eligible_branches, backlogs ≤ max_backlogs, passing year matches

## 3.8 Job Application

**Preconditions:**
- Job status is `OPEN`
- Student has an uploaded resume
- Student meets eligibility criteria
- Student has not already applied for this job

**Process:**
1. Eligibility validated at API level
2. Duplicate application check performed
3. Resume resolved (custom if provided, else default profile resume)
4. Application created with status `Applied`
5. Notification created for the student

## 3.9 Applicant Management

- Employers view applicants for their jobs
- Filter by CGPA, branch, skills
- Filters apply only if provided; no filter returns all applicants

## 3.10 Recruitment Rounds

- Employers define custom recruitment rounds for a job
- Each round has a name and a sequential order
- `round_order` must be unique per job

## 3.11 Application Status Progression

| Status          | Description                      |
|-----------------|----------------------------------|
| Applied         | Submitted                        |
| Shortlisted     | Selected for rounds              |
| Round1_Cleared  | Cleared first round              |
| Round2_Cleared  | Cleared second round             |
| Selected        | Final selection                  |
| Rejected        | Rejected at any stage            |

- Invalid status transitions are rejected

## 3.12 Notifications

- Notifications are created server-side on: job creation, application status changes, round result updates
- Notifications are user-specific and tracked as read/unread
- Frontend fetches notifications on-demand via `GET /notifications` (REST polling)
- No real-time push mechanism (no WebSocket, no SSE)

## 3.13 Student Dashboard

Displays:
- Profile completion status
- Count of eligible OPEN jobs
- Submitted applications
- Application status
- Analytics summary

## 3.14 Student Analytics

Tracked per student:
- Total applications submitted
- Times shortlisted
- Interviews attended

## 3.15 Admin Controls

- Approve or reject employer registrations
- View all students and companies
- Monitor system activity
- View placement statistics
- Remove invalid or suspicious employer accounts
- Manage job postings

---

# 4. Non-Functional Requirements

## 4.1 Security

- JWT authentication on all protected endpoints
- Passwords stored as hashed values (never plaintext)
- Role-based access control enforced at the API level
- API-level input validation before any database operation
- Resume files validated for type (PDF only) and size (max 1MB)

## 4.2 Reliability

- Strict validation prevents invalid data from reaching the database
- Duplicate applications are blocked at the service layer
- Status transitions are validated before persistence

## 4.3 Performance

- System supports multiple concurrent users
- Notifications are fetched on-demand; no persistent connections required

## 4.4 Scalability

- Architecture is designed to be extendable to a multi-college system

---

# 5. Future Scope

- Multi-college system support
- General email notification system (currently only password reset emails are sent)
- AI-based resume analysis
- Interview scheduling
- Advanced analytics and reporting
- Cloud storage for resume files (currently stored on server filesystem)
- Docker containerization and cloud deployment
