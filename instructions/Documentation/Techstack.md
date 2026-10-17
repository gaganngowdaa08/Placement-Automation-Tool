# Placement Automation Tool (PAT)

## Technology Stack

This document defines the technology stack used to build the Placement Automation Tool (PAT).

---

# 1. System Architecture Overview

PAT follows a **3-tier architecture** with additional system components:
Client (Browser)
│
▼
Frontend (React.js)
│  REST API over HTTP (Axios)
▼
Backend (Spring Boot)
│
├── JWT Security Layer
├── Resume Upload Handler → Server Filesystem (uploads/resumes/)
├── Password Reset Service → SMTP (Spring Mail)
└── Notification Service (REST-based)
│
▼
Database (MySQL)

---

# 2. Frontend

The frontend renders the user interface and communicates with the backend via REST APIs.

| Technology  | Purpose                                |
|-------------|----------------------------------------|
| React.js    | UI component framework                 |
| Vite        | Build tool and dev server              |
| TailwindCSS | Utility-first CSS styling              |
| Axios       | HTTP client for REST API communication |
| HTML5       | Page structure                         |
| CSS3        | Supplemental styling                   |
| JavaScript  | Application logic                      |

**Responsibilities:**
- Authentication interface (login, register, forgot/reset password)
- Student, Employer, and Admin dashboards
- Job browsing and application workflow
- Resume upload interface
- Notification display
- Analytics dashboard

---

# 3. Backend

The backend handles all business logic, authentication, file handling, and data access.

| Technology          | Purpose                              |
|---------------------|--------------------------------------|
| Java                | Programming language                 |
| Spring Boot         | Application framework                |
| Spring Web          | REST API development                 |
| Spring Security     | Authentication and authorization     |
| JWT (HS256)         | Stateless API authentication         |
| Spring Data JPA     | Data access abstraction              |
| Hibernate           | ORM (Object Relational Mapping)      |
| Lombok              | Boilerplate reduction                |
| Jakarta Validation  | Annotation-based input validation    |
| Spring Mail         | SMTP email for password reset        |
| Multipart File API  | Resume PDF upload and storage        |

**Responsibilities:**
- User authentication and JWT issuance
- Role-based access control (Student, Employer, Admin)
- Student profile and academic data management
- Employer registration and approval workflow
- Job posting lifecycle (OPEN → CLOSED → DELETED)
- Eligibility validation and application processing
- Recruitment round and round result management
- Resume upload, validation, and filesystem storage
- Password reset via SMTP email
- Notification creation and retrieval
- Analytics data management

---

# 4. Authentication and Security

| Mechanism       | Detail                                                        |
|-----------------|---------------------------------------------------------------|
| Authentication  | Spring Security + JWT                                         |
| Token type      | Access token only (no refresh tokens)                         |
| Token expiry    | 24 hours; user must log in again after expiry                 |
| Signing         | HS256                                                         |
| Authorization   | Role-based, enforced at controller level                      |
| Passwords       | Stored as hashed values                                       |

---

# 5. File Storage

| Aspect          | Detail                                           |
|-----------------|--------------------------------------------------|
| Upload method   | Multipart form-data (Spring MultipartFile)        |
| Storage         | Server local filesystem                          |
| Path pattern    | `uploads/resumes/{userId}.pdf`                   |
| DB storage      | Path/URL only — no binary stored in DB           |
| Validation      | PDF only, max 1MB, sanitized filename            |
| Overwrite       | New upload replaces existing file for same user  |

---

# 6. Email Service

| Aspect   | Detail                                  |
|----------|-----------------------------------------|
| Library  | Spring Mail (Java MailSender)           |
| Protocol | SMTP                                    |
| Usage    | Password reset only                     |

General notification emails are **not** implemented. Application and status notifications are stored in the database and fetched via REST API.

---

# 7. Notification System

| Aspect        | Detail                                          |
|---------------|-------------------------------------------------|
| Mechanism     | REST API polling (on-demand fetch)              |
| Real-time     | No WebSocket, no SSE                            |
| Triggers      | Job creation, status updates, round results     |
| Tracking      | Per-user, read/unread state stored in DB        |

---

# 8. Database

| Technology | Purpose                                |
|------------|----------------------------------------|
| MySQL      | Relational database management system  |

**Data access:** Spring Data JPA + Hibernate ORM

**Tables:** users, students, student_academic, employers, jobs, resumes, applications, recruitment_rounds, round_results, notifications, student_analytics

---

# 9. Build and Dependency Management

| Tool  | Purpose                              |
|-------|--------------------------------------|
| Maven | Dependency management and build tool |

Main configuration file: `pom.xml`

---

# 10. Configuration

Application configuration is stored in:
application.properties

Key configuration areas: database connection, JWT secret and expiry, SMTP settings, file upload path.

---

# 11. API Testing

| Tool    | Purpose                    |
|---------|----------------------------|
| Postman | API testing and debugging  |

---

# 12. Version Control

| Tool   | Purpose                      |
|--------|------------------------------|
| Git    | Source code version control  |
| GitHub | Remote repository hosting    |

---

# 13. Project Repository Structure

PAT/
│
├── backend/
├── frontend/
├── docs/
│   ├── ER_diagram.md
│   ├── Database_schema.md
│   ├── System_architecture.md
│   ├── Sequence_diagrams.md
│   ├── use_case_diagram.md
│   ├── API_design.md
│   ├── System_requirements.md
│   └── Techstack.md
│
└── README.md

---

# 14. Future Technology Improvements

- Docker containerization
- Cloud deployment (AWS / Azure)
- Cloud storage for resume files (S3 or equivalent)
- General email notification system
- CI/CD pipelines
- Multi-college architecture support
