# Placement Automation Tool (PAT)

## Sequence Diagrams

This document illustrates the key workflows in the Placement Automation Tool.

---

# 1. Student Registration Flow

```mermaid
sequenceDiagram
    participant Student
    participant Frontend
    participant Backend
    participant Database

    Student->>Frontend: Submit registration form
    Frontend->>Backend: POST /auth/register

    Backend->>Backend: Validate input (email, password, role)

    alt Validation Failed
        Backend-->>Frontend: 400 Error response
        Frontend-->>Student: Show error message
    else Validation Success
        Backend->>Database: Save user record
        Database-->>Backend: Success
        Backend-->>Frontend: 201 Registration success
        Frontend-->>Student: Account created
    end
```

---

# 2. Login and JWT Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database

    User->>Frontend: Submit login credentials
    Frontend->>Backend: POST /auth/login

    Backend->>Database: Fetch user by email
    Database-->>Backend: User record

    Backend->>Backend: Verify password hash

    alt Invalid Credentials
        Backend-->>Frontend: 401 Unauthorized
        Frontend-->>User: Show error
    else Valid Credentials
        Backend->>Backend: Generate JWT (access token, 24h expiry)
        Backend-->>Frontend: 200 { token, role }
        Frontend->>Frontend: Store token in client
        Frontend-->>User: Redirect to dashboard
    end
```

**Notes:**
- Only access tokens are used. There is no refresh token mechanism.
- Token expiry is 24 hours. After expiry the user must log in again.
- All subsequent requests include the JWT in the Authorization header.

---

# 3. Forgot Password Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database
    participant EmailService

    User->>Frontend: Submit registered email
    Frontend->>Backend: POST /auth/forgot-password

    Backend->>Database: Find user by email
    Database-->>Backend: User record

    Backend->>Backend: Generate reset_token + set reset_token_expiry
    Backend->>Database: Save reset_token and reset_token_expiry

    Backend->>EmailService: Send password reset email (SMTP)
    EmailService-->>User: Email with reset link

    User->>Frontend: Click reset link, submit new password
    Frontend->>Backend: POST /auth/reset-password { token, newPassword }

    Backend->>Database: Fetch user by reset_token
    Backend->>Backend: Validate token expiry

    alt Token Invalid or Expired
        Backend-->>Frontend: 400 Error
        Frontend-->>User: Show error message
    else Token Valid
        Backend->>Backend: Hash new password
        Backend->>Database: Update password_hash, clear reset_token and reset_token_expiry
        Backend-->>Frontend: 200 Success
        Frontend-->>User: Password updated, redirect to login
    end
```

---

# 4. Resume Upload Flow

```mermaid
sequenceDiagram
    participant Student
    participant Frontend
    participant Backend
    participant Filesystem
    participant Database

    Student->>Frontend: Select PDF file and submit
    Frontend->>Backend: POST /students/resume (multipart/form-data)

    Backend->>Backend: Validate JWT and extract userId
    Backend->>Backend: Validate file (PDF only, max 1MB)

    alt Validation Failed
        Backend-->>Frontend: 400 Error (invalid format or size)
        Frontend-->>Student: Show error message
    else Validation Success
        Backend->>Filesystem: Store file at uploads/resumes/{userId}.pdf
        Filesystem-->>Backend: File saved
        Backend->>Database: Save/update resume record (resume_file = "/uploads/resumes/{userId}.pdf")
        Database-->>Backend: Success
        Backend-->>Frontend: 201 { resumeUrl, fileName, uploadedAt }
        Frontend-->>Student: Resume uploaded successfully
    end
```

**Notes:**
- Uploading a new resume overwrites the existing file for the same user.
- `resume_file` in the database stores the server path, not the binary file.
- Employers access resumes by navigating to `http://localhost:8080/uploads/resumes/{userId}.pdf`.

---

# 5. Job Application Flow

```mermaid
sequenceDiagram
    participant Student
    participant Frontend
    participant Backend
    participant Database

    Student->>Frontend: Click Apply on a job
    Frontend->>Backend: POST /jobs/{job_id}/apply

    Backend->>Database: Fetch job (check status = OPEN)
    Backend->>Database: Fetch student profile
    Backend->>Backend: Check eligibility (CGPA, branch, backlogs, passing year)
    Backend->>Database: Check for duplicate application

    alt Job Closed or Ineligible or Duplicate
        Backend-->>Frontend: 400/409 Error with reason
        Frontend-->>Student: Show rejection reason
    else All Checks Pass
        Backend->>Database: Resolve resume (custom if provided, else default)
        Backend->>Database: Create application record (status = Applied)
        Backend->>Database: Create notification for student
        Database-->>Backend: Success
        Backend-->>Frontend: 201 Application created
        Frontend-->>Student: Application submitted
    end
```

---

# 6. Employer Approval Flow

```mermaid
sequenceDiagram
    participant Employer
    participant Frontend
    participant Backend
    participant Database

    Employer->>Frontend: Register company account
    Frontend->>Backend: POST /auth/register + POST /employers/profile

    Backend->>Database: Save employer (approved_status = false)

    Note over Backend,Database: Employer cannot post jobs until approved

    Backend->>Database: Create notification for Admin
    Backend-->>Frontend: Registration submitted

    Admin->>Frontend: Review pending employers
    Frontend->>Backend: GET /admin/employers

    Admin->>Frontend: Approve or Reject employer
    Frontend->>Backend: PUT /admin/employers/{employer_id}/approve

    Backend->>Database: Set approved_status = true
    Backend->>Database: Create notification for Employer
    Database-->>Backend: Success
    Backend-->>Frontend: 200 Approved
    Frontend-->>Admin: Confirmation
```

---

# 7. Employer Job Posting Flow

```mermaid
sequenceDiagram
    participant Employer
    participant Frontend
    participant Backend
    participant Database

    Employer->>Frontend: Fill job creation form
    Frontend->>Backend: POST /jobs

    Backend->>Backend: Validate JWT, confirm approved_status = true
    Backend->>Backend: Validate required fields and business rules

    alt Validation Failed
        Backend-->>Frontend: 400 Error with field errors
        Frontend-->>Employer: Show validation errors
    else Validation Success
        Backend->>Database: Save job (status = OPEN)
        Backend->>Database: Create notifications for eligible students
        Database-->>Backend: Success
        Backend-->>Frontend: 201 Job created
        Frontend-->>Employer: Job is live
    end
```

---

# 8. Recruitment Round Update Flow

```mermaid
sequenceDiagram
    participant Employer
    participant Frontend
    participant Backend
    participant Database

    Employer->>Frontend: Update round result for applicant
    Frontend->>Backend: PUT /applications/{application_id}/round-result

    Backend->>Backend: Validate JWT and role
    Backend->>Database: Fetch application and round

    alt Invalid Request
        Backend-->>Frontend: 400/404 Error
        Frontend-->>Employer: Show error
    else Valid Request
        Backend->>Database: Update round_results record
        Backend->>Database: Update application status
        Backend->>Database: Create notification for student
        Database-->>Backend: Success
        Backend-->>Frontend: 200 Update complete
        Frontend-->>Employer: Confirmation
    end
```

---

# 9. Notification Fetch Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database

    User->>Frontend: Open notification panel
    Frontend->>Backend: GET /notifications (JWT in header)

    Backend->>Backend: Extract userId from JWT
    Backend->>Database: Fetch notifications for userId

    Database-->>Backend: Notification list
    Backend-->>Frontend: 200 Notification list
    Frontend-->>User: Display notifications

    User->>Frontend: Click on notification
    Frontend->>Backend: PUT /notifications/{notification_id}/read
    Backend->>Database: Set is_read = true
    Backend-->>Frontend: 200 OK
```

**Notes:**
- Notifications are fetched on-demand (REST polling). There is no WebSocket or Server-Sent Events implementation.
- Notifications are created server-side on relevant events (job creation, status updates, round results).
