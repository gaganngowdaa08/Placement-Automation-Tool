# Placement Automation Tool (PAT)

## Updated Entity Relationship Diagram (ERD)

This ER diagram represents the updated database structure and relationships for the Placement Automation Tool.

---

```mermaid
erDiagram

    USERS {
        int user_id PK
        string email
        string password_hash
        enum role
        datetime created_at
        string reset_token
        datetime reset_token_expiry
    }

    STUDENTS {
        int student_id PK
        int user_id FK
        string full_name
        string phone_number
        string usn
        string branch
        decimal cgpa
        int backlog_count
        int passing_year
        text skills
        text projects
        string linkedin_url
        string github_url
        boolean profile_completed
    }

    STUDENT_ACADEMIC {
        int academic_id PK
        int student_id FK
        string degree
        double tenth
        double twelfth
        int semester
        text certifications
    }

    EMPLOYERS {
        int employer_id PK
        int user_id FK
        string company_name
        text company_description
        boolean approved_status
        datetime created_at
    }

    JOBS {
        int job_id PK
        int employer_id FK
        string job_title
        text job_description
        string salary_package
        string job_location
        decimal min_cgpa
        text eligible_branches
        int max_backlogs
        int passing_year
        date application_deadline
        date placement_drive_date
        datetime created_at
        enum status
    }

    RESUMES {
        int resume_id PK
        int student_id FK
        text resume_file
        datetime uploaded_at
        boolean is_default
    }

    APPLICATIONS {
        int application_id PK
        int student_id FK
        int job_id FK
        int resume_id FK
        enum status
        datetime applied_at
    }

    RECRUITMENT_ROUNDS {
        int round_id PK
        int job_id FK
        string round_name
        int round_order
        datetime created_at
    }

    ROUND_RESULTS {
        int result_id PK
        int application_id FK
        int round_id FK
        string status
        datetime updated_at
    }

    NOTIFICATIONS {
        int notification_id PK
        int user_id FK
        string message
        boolean is_read
        datetime created_at
    }

    STUDENT_ANALYTICS {
        int student_id PK
        int applications_count
        int shortlisted_count
        int interviews_given
    }

    USERS ||--|| STUDENTS : "has"
    USERS ||--|| EMPLOYERS : "has"

    STUDENTS ||--|| STUDENT_ACADEMIC : "has"

    EMPLOYERS ||--o{ JOBS : "posts"

    STUDENTS ||--o{ RESUMES : "uploads"
    STUDENTS ||--o{ APPLICATIONS : "submits"

    JOBS ||--o{ APPLICATIONS : "receives"

    JOBS ||--o{ RECRUITMENT_ROUNDS : "has"

    APPLICATIONS ||--o{ ROUND_RESULTS : "contains"

    RECRUITMENT_ROUNDS ||--o{ ROUND_RESULTS : "records"

    USERS ||--o{ NOTIFICATIONS : "receives"

    STUDENTS ||--|| STUDENT_ANALYTICS : "has"
