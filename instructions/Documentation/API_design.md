# Placement Automation Tool (PAT)

## REST API Design

This document defines the REST API endpoints for the Placement Automation Tool (PAT).

Base URL:
/api/v1
All endpoints except `/auth/register`, `/auth/login`, `/auth/forgot-password`, and `/auth/reset-password` require a valid JWT in the Authorization header:

Authorization: Bearer <token>
---

# 1. Authentication APIs

## Register User
POST /auth/register
**Access:** Public

**Request Body:**

```json
{
  "email": "student@email.com",
  "password": "securepassword",
  "role": "student"
}
```

---

## Login
POST /auth/login
**Access:** Public

**Request Body:**

```json
{
  "email": "user@email.com",
  "password": "password"
}
```

**Response:**

```json
{
  "token": "jwt_access_token",
  "role": "student"
}
```

**Notes:**
- Returns a single access token valid for 24 hours.
- No refresh token is issued. After expiry, the user must log in again.

---

## Forgot Password
POST /auth/forgot-password
**Access:** Public

**Request Body:**

```json
{
  "email": "user@email.com"
}
```

**Behavior:**
- Generates a `reset_token` and sets `reset_token_expiry` on the user record.
- Sends a password reset link to the provided email via SMTP.

---

## Reset Password
POST /auth/reset-password
**Access:** Public

**Request Body:**

```json
{
  "token": "reset_token_value",
  "newPassword": "newsecurepassword"
}
```

**Behavior:**
- Validates the token and expiry.
- Updates the password hash.
- Clears `reset_token` and `reset_token_expiry`.

---

# 2. Student APIs

## Get Student Profile
GET /students/profile 

**Access:** Student

---

## Update Student Profile
PUT /students/profile

**Access:** Student

---

## Upload Resume
POST /students/resume
**Access:** Student

**Request:** `multipart/form-data`

| Parameter | Type | Description          |
|-----------|------|----------------------|
| file      | File | PDF file, max 1MB    |

**Validation:**
- PDF format only
- Max file size: 1MB
- Filename is sanitized before storage

**Behavior:**
- Stores the file at `uploads/resumes/{userId}.pdf`
- Overwrites existing resume if one exists
- Saves path and metadata to the `resumes` table

**Response:**

```json
{
  "resumeUrl": "/uploads/resumes/5.pdf",
  "fileName": "resume.pdf",
  "uploadedAt": "2026-01-15T10:30:00"
}
```

---

## Get All Resumes
GET /students/resumes

**Access:** Student

---

## Get Student Analytics
GET /students/analytics

**Access:** Student

---

## Get Student Applications
GET /students/applications

**Access:** Student

---

# 3. Job APIs

## Get All Jobs (Student View)
GET /jobs

**Access:** Student

**Query Parameters:**

| Parameter | Type   | Description            |
|-----------|--------|------------------------|
| branch    | String | Filter by branch       |
| min_cgpa  | Double | Filter by minimum CGPA |

**Notes:**
- Returns only `OPEN` status jobs.

---

## Get Job Details
GET /jobs/{job_id}

**Access:** Student, Employer

---

## Apply for Job

POST /jobs/{job_id}/apply

**Access:** Student

**Request Body:**

```json
{
  "resume_id": 123
}
```

**Behavior:**
- Checks job status is `OPEN`
- Validates student eligibility (CGPA, branch, backlogs, passing year)
- Prevents duplicate applications
- Falls back to default resume if no `resume_id` is provided
- Creates application with status `Applied`
- Creates a notification for the student

---

## Get Applicants for Job
GET /jobs/{job_id}/applicants

**Access:** Employer

**Query Filters:**

| Parameter | Type   | Description        |
|-----------|--------|--------------------|
| cgpa      | Double | Filter by CGPA     |
| branch    | String | Filter by branch   |
| skills    | String | Filter by skill    |

---

# 4. Employer APIs

## Register Employer Profile

POST /employers/profile

**Access:** Employer (unapproved)

**Request Body:**

```json
{
  "company_name": "Google",
  "company_description": "Technology company"
}
```

---

## Post Job
**Access:** Employer (approved only)

**Request Body:**

```json
{
  "job_title": "Software Engineer",
  "salary_package": "18 LPA",
  "application_deadline": "2026-10-20",
  "placement_drive_date": "2026-10-25",
  "job_description": "Backend development",
  "job_location": "Bangalore",
  "min_cgpa": 7.0,
  "eligible_branches": ["CSE", "ISE"],
  "max_backlogs": 0,
  "passing_year": 2026
}
```

**Required Fields:** `job_title`, `salary_package`, `application_deadline`, `placement_drive_date`

**Optional Fields:** `job_description`, `job_location`, `min_cgpa`, `eligible_branches`, `max_backlogs`, `passing_year`

**Validation Rules:**
- `job_title` and `salary_package` must not be empty
- `application_deadline` must be a future date
- `placement_drive_date` ≥ `application_deadline`
- `min_cgpa` (if provided): 0–10
- `max_backlogs` (if provided): ≥ 0

**Behavior:**
- Job is created with `status = OPEN`

---

## Edit Job
PUT /jobs/{job_id}

**Access:** Employer (owner only)

---

## Update Job Status

PUT /jobs/{job_id}/status

**Access:** Employer (owner only)

**Request Body:**

```json
{
  "status": "CLOSED"
}
```

**Valid Values:** `OPEN`, `CLOSED`, `DELETED`

**Effects:**
- `CLOSED`: No new applications accepted
- `DELETED`: Job removed from student-facing listings

---

## Get Employer's Jobs
GET /employers/jobs
**Access:** Employer

---

# 5. Recruitment Round APIs

## Create Recruitment Round
POST /jobs/{job_id}/rounds

**Access:** Employer

---

## Get Job Rounds
GET /jobs/{job_id}/rounds

**Access:** Employer, Student

---

## Update Round Result
PUT /applications/{application_id}/round-result
**Access:** Employer

---

# 6. Application Management APIs

## Update Application Status

PUT /applications/{application_id}/status

**Access:** Employer

**Valid Status Transitions:**
Applied → Shortlisted → Round1_Cleared → Round2_Cleared → Selected
Applied → Rejected (any point)

**Access:** Student (own), Employer (applicants for their jobs)

---

# 7. Notification APIs

## Get Notifications

GET /notifications

**Access:** Authenticated users (any role)

**Notes:**
- Fetched on-demand when the user opens the notification panel.
- No real-time push mechanism.

---

## Mark Notification as Read
PUT /notifications/{notification_id}/read

**Access:** Authenticated users (own notifications only)

---

# 8. Admin APIs

## Get All Students

GET /admin/students

**Access:** Admin

---

## Get All Employers
GET /admin/employers

**Access:** Admin

---

## Approve Employer

PUT /admin/employers/{employer_id}/approve

**Access:** Admin

---

## Reject / Remove Employer

DELETE /admin/employers/{employer_id}

**Access:** Admin

---

## Get Placement Statistics
GET /admin/statistics
**Access:** Admin

---

## Manage Jobs (Admin)
GET /admin/jobs
DELETE /admin/jobs/{job_id}

**Access:** Admin

---

# 9. Security and Validation Summary

| Rule                              | Detail                                                     |
|-----------------------------------|------------------------------------------------------------|
| Authentication                    | JWT access token, 24-hour expiry, no refresh tokens        |
| Authorization                     | Role-based, enforced at controller level                   |
| Input validation                  | API-level validation before any DB operation               |
| Resume validation                 | PDF only, max 1MB, sanitized filename                      |
| Job status filtering              | Only OPEN jobs visible to students                         |
| Duplicate application prevention  | Enforced at service layer                                  |
| Employer approval gate            | Unapproved employers cannot post jobs                      |

---

# API Roles Summary

| Role     | Access                                                        |
|----------|---------------------------------------------------------------|
| Student  | Profile, academic details, resume, jobs, applications, notifications, analytics |
| Employer | Job management (post/edit/status), applicants, recruitment rounds, notifications |
| Admin    | Employer approval, job management, student monitoring, statistics               |

