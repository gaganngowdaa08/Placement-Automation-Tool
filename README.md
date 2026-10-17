<div align="center">

# Placement Automation Tool (PAT)

**A role-based placement management portal for students, colleges, and hiring companies.**

React · Spring Boot · Java 21 · MySQL · Docker Compose

[![React](https://img.shields.io/badge/React-19-149eca?logo=react&logoColor=white)](https://react.dev/)
[![Java](https://img.shields.io/badge/Java-21-ed8b00?logo=openjdk&logoColor=white)](https://www.oracle.com/java/)
[![Spring Boot](https://img.shields.io/badge/Spring%20Boot-4-6db33f?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![MySQL](https://img.shields.io/badge/MySQL-8.4-4479a1?logo=mysql&logoColor=white)](https://www.mysql.com/)
[![Docker Compose](https://img.shields.io/badge/Docker-Compose-2496ed?logo=docker&logoColor=white)](https://docs.docker.com/compose/)

</div>

---

## About the project

The Placement Automation Tool (PAT) brings placement-related workflows into one web application. Students manage their profiles and resumes, companies post placement drives and evaluate applicants, and colleges review placement requests and track outcomes.

The current project is a **locally runnable portfolio/learning application**, with the main role-based workflows connected to a Spring Boot API and MySQL. The features listed below have been manually exercised in the local version. It is not represented as a production-ready placement service.

## Main features

### Student workspace
- Student registration and sign-in.
- Personal profile and academic details saved through the backend.
- PDF resume upload and resume preview from the student's own Resume Library.
- Browse college-approved placement drives and apply when the saved profile and eligibility criteria qualify.
- Track applications and interview-round decisions after refreshing or signing back in.

### Company workspace
- Company account and profile.
- Create and manage company-owned job/placement-drive posts.
- Choose a **targeted drive** for one or more registered colleges or a **pool drive** for all colleges.
- Review applicants for the company's own jobs and open the PDF attached to an application.
- Record interview decisions across rounds 1–5.

### College workspace
- College/institution account and profile.
- Review incoming placement-drive requests and approve or reject them.
- View placement outcomes for students associated with the institution.

### Workflow and data protection
- Role-aware API access for Student, College, and Company accounts.
- Password hashing and JWT-based authentication.
- MySQL persistence for accounts, profiles, academic details, jobs, applications, and interview status.
- Resume PDFs stored in a persistent Docker volume; resume metadata is stored in MySQL.
- Target-college and academic eligibility checks are enforced by the backend, not only by the UI.
- Docker Compose runs the frontend, API, MySQL, and compatibility migration service.

> **Drive matching note:** College/company matching currently uses registered institution names rather than a centrally managed institution ID. This keeps the project simple for local demonstration, but a production system should add verified institution identities and administrative controls.

## Technology stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router, Tailwind CSS |
| Backend | Java 21, Spring Boot, Spring Web, Spring Security, Spring Data JPA |
| Authentication | JWT, BCrypt password hashing |
| Database | MySQL 8.4 |
| File storage | Filesystem path mounted to a named Docker volume |
| Containers | Docker, Docker Compose |
| Backend build | Maven Wrapper (`mvnw` / `mvnw.cmd`) |
| Frontend quality/build tools | npm scripts, Vite, ESLint |

## Repository layout

```text
.
├── backend_pat/                 # Spring Boot REST API
│   ├── src/main/java/           # Controllers, entities, repositories, services, security
│   ├── src/main/resources/      # Backend configuration
│   ├── mvnw                     # Maven wrapper (Unix-like shells)
│   ├── mvnw.cmd                 # Maven wrapper (Windows)
│   └── pom.xml                  # Java dependencies and build configuration
├── pat-frontend/                # React/Vite client
│   ├── src/                     # Pages, components, API client, routing
│   ├── package.json             # Frontend scripts and dependencies
│   └── Dockerfile               # Frontend container build
├── database/
│   ├── schema.sql               # Initial schema for a fresh database volume
│   └── migrations/              # Compatibility/feature SQL migrations
├── instructions/                # Project planning and technical reference documents
├── .env.example                 # Safe configuration template; no real credentials
├── docker-compose.yml           # Local full-stack environment
└── README.md
```

## Run the full application with Docker Compose

### Prerequisites

- Docker Desktop installed and running.
- Git, if cloning the repository.

Verify Docker in PowerShell:

```powershell
docker --version
docker compose version
```

### 1. Configure environment variables

Run from the repository root (the directory containing `docker-compose.yml`):

```powershell
Copy-Item .env.example .env
notepad .env
```

Replace the example password/secret values in `.env` with unique local values. Keep `.env` private; commit `.env.example` only. These settings are for local development and are not production secrets.

### 2. Build and start the stack

```powershell
docker compose config
docker compose up --build -d
docker compose ps
```

Compose starts MySQL, runs the migration service, then starts the backend and frontend. Wait until the services show as running/healthy before opening the app.

- **Frontend:** [http://localhost:8081](http://localhost:8081)
- **Backend health check:** [http://localhost:8080/api/health](http://localhost:8080/api/health)

If startup fails, inspect the service logs:

```powershell
docker compose logs --tail=100 db-migrate
docker compose logs --tail=100 backend
docker compose logs --tail=100 frontend
```

The migration service should finish with exit code `0`. When reusing a database volume from an earlier local setup, the `.env` credentials must match the MySQL users/passwords that were set when that volume was first initialized. Updating `.env` alone does not rewrite credentials inside an existing MySQL volume.

### 3. Stop safely

```powershell
docker compose down
```

This stops/removes containers but keeps named volumes. **Do not use `docker compose down -v` if you need to preserve local MySQL data or uploaded resumes.** The initial `database/schema.sql` is intended for a fresh MySQL data directory; do not manually run it against data you need to keep because it contains schema-reset statements.

## First-use walkthrough

Use separate email addresses for each role:

1. Register a **College** account and save its institution name.
2. Register a **Company** account. Create a placement drive and select either targeted college(s) or a pool drive.
3. Sign in to the matching **College** account and approve or reject the placement request.
4. Register a **Student** account and complete personal and academic information, including the college name where prompted.
5. Upload a PDF resume (up to 5 MB) in Resume Library.
6. Browse approved drives and apply when eligible. For a targeted drive, students from colleges outside the target list cannot submit an application.
7. Sign in as the company, review applicants, open the resume PDF for an applicant on the company's own job, and update interview-round decisions.
8. Return to the student account and verify the saved application/interview status after refreshing.

For reliable testing, use test data and PDFs rather than real candidate personal information.

## Development commands

The Docker Compose route above is the simplest way to run the complete application. For separate local development, use a local MySQL instance and start the backend and frontend in separate terminals.

### Frontend scripts

Run in `pat-frontend/`:

| Command | Purpose |
|---|---|
| `npm ci` | Install the locked frontend dependency versions |
| `npm run dev` | Start the Vite development server |
| `npm run build` | Create a production frontend bundle in `dist/` |
| `npm run preview` | Preview the generated production bundle |
| `npm run lint` | Run ESLint checks |

For local Vite development, the config proxies `/api` requests to `http://localhost:8080`. The development UI is normally available at [http://localhost:5173](http://localhost:5173).

### Backend commands

Run in `backend_pat/` after setting `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, `JWT_SECRET`, and (optionally) `UPLOAD_DIR` for your local environment.

Windows PowerShell:

```powershell
$env:DB_URL = "jdbc:mysql://localhost:3306/pat_system?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC"
$env:DB_USERNAME = "your-mysql-user"
$env:DB_PASSWORD = "your-local-password"
$env:JWT_SECRET = "use-a-unique-local-secret-at-least-32-characters-long"
$env:UPLOAD_DIR = "./uploads/resumes"

.\mvnw.cmd spring-boot:run
```

Useful Maven Wrapper commands:

```powershell
.\mvnw.cmd test
.\mvnw.cmd package
```

Use Java 21. Maven Wrapper downloads the configured Maven distribution the first time it runs, so an internet connection may be needed on a fresh development machine.

## API route overview

Protected endpoints require the JWT returned by login in the header `Authorization: Bearer <token>`.

| Method | Endpoint | Purpose / access |
|---|---|---|
| `GET` | `/api/health` | Health check |
| `POST` | `/api/auth/register` | Create Student, College, or Company account |
| `POST` | `/api/auth/login` | Authenticate and return a JWT |
| `GET` | `/api/jobs` | List open, approved drives available for browsing |
| `GET` | `/api/jobs/{id}` | Read a job |
| `GET`, `PUT` | `/api/students/me/profile` | Read/save own student profile |
| `GET`, `PUT` | `/api/students/me/academic` | Read/save own academic details |
| `GET`, `POST` | `/api/students/me/resume` | List/upload own PDF resumes |
| `GET` | `/api/students/me/resume/{resumeId}/file` | Preview a resume owned by the signed-in student |
| `GET`, `POST` | `/api/students/me/applications` | List own applications / apply to a drive |
| `GET`, `PUT` | `/api/company/me/profile` | Read/save own company profile |
| `GET`, `POST` | `/api/company/jobs` | List own jobs / publish a drive |
| `GET` | `/api/company/jobs/{jobId}/applications` | Review applicants for a company-owned job |
| `GET` | `/api/company/applications/{applicationId}/resume` | Preview resume attached to an application for the company's own job |
| `PUT` | `/api/company/applications/{applicationId}/decision` | Save an interview-round decision |
| `GET`, `PUT` | `/api/college/me/profile` | Read/save own college profile |
| `GET` | `/api/college/me/profile/requests` | Review placement requests |
| `POST` | `/api/college/me/profile/requests/{jobId}/decision` | Approve/reject a placement request |
| `GET` | `/api/college/me/profile/outcomes` | View college placement outcomes |

The request/response DTOs and authorization rules in the source code are the definitive reference for exact payload shapes.

## Data, privacy, and security notes

- Never commit `.env`, real credentials, database dumps, uploaded resumes, or local user data. The root `.gitignore` excludes common local secret/build/upload paths.
- Use unique secrets in `.env`; do not reuse any local development value for a hosted environment.
- Uploaded resume PDFs may contain personal data. Use synthetic/test documents when demonstrating the project and do not commit candidate files to Git.
- A public GitHub repository is source-code hosting; it does **not** deploy this Docker Compose stack to a public URL. Hosting it publicly requires configuring a server or deployment platform, managed database, persistent file storage, HTTPS, backups, CORS, and production-grade secret management.
- This project has not been hardened for production use. A production version should add verified institution identities, administrative account verification, stronger abuse/rate controls, observability, and a tested backup/restore process.

---

*Built as a full-stack engineering project to explore role-based access, REST APIs, relational persistence, file handling, and Docker-based local development.*
