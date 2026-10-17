# PAT Project – Day 1 Task Board

Date: March 17

Phase: **Phase 1 – System Foundation**
Goal: Build the backend data backbone and frontend UI skeleton so development can begin in parallel.

---

# Global Team Learning Rule (Mandatory)

Every developer must follow this process when using AI.

1. Generate code with AI.
2. Ask AI to explain every annotation or unfamiliar concept.
3. Write a **5‑line summary** in the shared team learning document.

Example questions developers must ask AI:

* What does `@Entity` do?
* What does `JpaRepository` do?
* What does `@ManyToOne` mean?

If a developer cannot explain the code they added, it should not be committed.

---

# Backend Tasks (5 Developers)

## Objective Today

Create all **core entities and repositories** so the database structure is ready.

Success criteria:

* Spring Boot runs successfully
* Database tables are created
* All repositories compile

---

## Backend Dev 1 – Authentication / User Entity

### Total Tasks for the Day

1. Create the `User` entity class.
2. Create the `UserRepository` interface.
3. Run the Spring Boot application and verify the `users` table is created in MySQL.

Each task should be completed in order. The entity must compile successfully before creating the repository.

### Tasks

Create file:

```
src/main/java/com/pat/backend_pat/entity/User.java
```

Fields required:

```
userId
email
passwordHash
role
createdAt
```

Use Lombok annotations.

Create repository:

```
src/main/java/com/pat/backend_pat/repository/UserRepository.java
```

Repository should extend:

```
JpaRepository<User, Long>
```

* Verify table creation in MySQL
* Ensure entity mapping works

### AI Prompt Example

```
I am building a Spring Boot backend for 
a Placement Automation Tool.

Current phase: System foundation.

Task: Create a User entity using Spring Boot + JPA + Lombok.

Package: com.pat.backend_pat.entity

Fields:
- userId (primary key)
- email
- passwordHash
- role (student, employer, admin)
- createdAt timestamp

Requirements:
- Use Lombok
- Use JPA annotations
- Explain each annotation line by line.
- Give me the line by line code explaining why we are writing this line and what's the purpose of this line. Give me the entire code in the end.
```

---

## Backend Dev 2 – Student Module

### Total Tasks for the Day

1. Create the `Student` entity class.
2. Implement the relationship between `Student` and `User`.
3. Create the `StudentRepository` interface.
4. Run the application and confirm the `students` table appears in the database.

### Tasks

Create file:

```
src/main/java/com/pat/backend_pat/entity/Student.java
```

Fields:

```
studentId
user
fullName
phoneNumber
usn
branch
cgpa
backlogCount
passingYear
skills
projects
```

Relationship:

```
@OneToOne with User
```

Create repository:

```
StudentRepository.java
```

Verify database table generation.

### AI Prompt Example

```
I am building the Student entity for a Spring Boot placement portal.

Current phase: system foundation.

Create a Student entity mapped with JPA.

Package: com.pat.backend_pat.entity

Fields:
- studentId
- user (OneToOne relationship with User)
- fullName
- phoneNumber
- usn
- branch
- cgpa
- backlogCount
- passingYear
- skills
- projects

Use Lombok and explain all annotations.
Give me the line by line code explaining why we are writing this line and what's the purpose of this line. Give me the entire code in the end.
```

---

## Backend Dev 3 – Employer Module

### Total Tasks for the Day

1. Create the `Employer` entity class.
2. Implement the `OneToOne` relationship with the `User` entity.
3. Create the `EmployerRepository` interface.
4. Run the application and confirm the `employers` table is created.

### Tasks

Create entity:

```
Employer.java
```

Fields:

```
employerId
user
companyName
companyDescription
approvedStatus
createdAt
```

Relationship:

```
@OneToOne with User
```

Create repository:

```
EmployerRepository.java
```

### AI Prompt Example

```
I am building the Employer entity for a Spring Boot placement system.

Phase: system foundation.

Create an Employer entity using JPA and Lombok.

Fields:
- employerId
- user (OneToOne relation with User entity)
- companyName
- companyDescription
- approvedStatus
- createdAt

Explain each annotation clearly.
Give me the line by line code explaining why we are writing this line and what's the purpose of this line. Give me the entire code in the end.
```

---

## Backend Dev 4 – Job Module

### Total Tasks for the Day

1. Create the `Job` entity class.
2. Implement the `ManyToOne` relationship with the `Employer` entity.
3. Create the `JobRepository` interface.
4. Run the application and verify the `jobs` table is generated.

### Tasks

Create entity:

```
Job.java
```

Fields:

```
jobId
employer
jobTitle
jobDescription
salaryPackage
jobLocation
minCgpa
eligibleBranches
maxBacklogs
passingYear
applicationDeadline
placementDriveDate
createdAt
```

Relationship:

```
@ManyToOne Employer
```

Create repository:

```
JobRepository.java
```

### AI Prompt Example

```
Create a Job entity for a Spring Boot placement portal.

Phase: system foundation.

Fields:
- jobId
- employer (ManyToOne relationship)
- jobTitle
- jobDescription
- salaryPackage
- jobLocation
- minCgpa
- eligibleBranches
- maxBacklogs
- passingYear
- applicationDeadline
- placementDriveDate
- createdAt

Use Lombok and explain the JPA relationships.
Give me the line by line code explaining why we are writing this line and what's the purpose of this line. Give me the entire code in the end.
```

---

## Backend Dev 5 – Application Module

### Total Tasks for the Day

1. Create the `Application` entity class.
2. Implement the `ManyToOne` relationships with `Student` and `Job`.
3. Create the `ApplicationRepository` interface.
4. Run the application and verify the `applications` table is created.

### Tasks

Create entity:

```
Application.java
```

Fields:

```
applicationId
student
job
status
appliedAt
```

Relationships:

```
@ManyToOne Student
@ManyToOne Job
```

Create repository:

```
ApplicationRepository.java
```

### AI Prompt Example

```
Create an Application entity for a Spring Boot placement portal.

Phase: system foundation.

Fields:
- applicationId
- student (ManyToOne relationship)
- job (ManyToOne relationship)
- status
- appliedAt

Use Lombok and explain every annotation.
Give me the line by line code explaining why we are writing this line and what's the purpose of this line. Give me the entire code in the end.
```

---

# Frontend Tasks (3 Developers)

Framework: React + Vite
Styling: **Tailwind CSS (recommended)**

Reason:

* Fast UI building
* Clean design
* Easy for beginners

---

## Frontend Dev 1 – Authentication UI

### Total Tasks for the Day

1. Create the authentication page folder structure.
2. Implement `Login.jsx`.
3. Implement `Register.jsx`.
4. Add Tailwind styling and form fields.

### Tasks

Create pages:

```
Login.jsx
Register.jsx
```

Create folder:

```
src/pages/auth
```

Add form inputs:

* email
* password

Add basic Tailwind styling.

### AI Prompt Example

```
Create a Login page using React + Vite + Tailwind CSS.

Fields required:
- email
- password

Explain the component structure and Tailwind classes used.
Give me the line by line code explaining why we are writing this line and what's the purpose of this line. Give me the entire code in the end.
```

---

## Frontend Dev 2 – Student Dashboard UI

### Total Tasks for the Day

1. Create the student pages folder.
2. Build `StudentDashboard.jsx` layout.
3. Build `JobList.jsx` component.
4. Add dummy job card UI for testing layout.

### Tasks

Create folder:

```
src/pages/student
```

Create components:

```
StudentDashboard.jsx
JobList.jsx
```

Create dummy job cards.

### AI Prompt Example

```
Create a Student Dashboard UI using React and Tailwind CSS.

Include:
- navigation sidebar
- job list cards

Explain the React component structure.
Give me the line by line code explaining why we are writing this line and what's the purpose of this line. Give me the entire code in the end.
```

---

## Frontend Dev 3 – Employer Dashboard UI

### Total Tasks for the Day

1. Create the employer pages folder.
2. Build `EmployerDashboard.jsx` layout.
3. Build `PostJob.jsx` form component.
4. Add basic Tailwind styling for the form.

### Tasks

Create folder:

```
src/pages/employer
```

Create components:

```
EmployerDashboard.jsx
PostJob.jsx
```

Create a job posting form UI.

Fields:

```
job title
salary
location
CGPA requirement
```

### AI Prompt Example

```
Create an Employer Dashboard UI using React and Tailwind CSS.

Include a form for posting a job.

Explain the React component structure and Tailwind usage.
Give me the line by line code explaining why we are writing this line and what's the purpose of this line. Give me the entire code in the end.
```

---

# End‑of‑Day Milestone

Backend:

* All entities created
* All repositories created
* Database tables generated

Frontend:

* Login page UI
* Register page UI
* Student dashboard skeleton
* Employer dashboard skeleton

If these are completed, Phase 1 foundation is successful.
