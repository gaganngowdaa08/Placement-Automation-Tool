# PAT — Phase 2: Student Profile + Resume Upload
## Task Allocation File | Date: 25 March 2026

---

> **Before anyone starts coding today:**
> 1. Everyone runs `git pull origin dev` first
> 2. Everyone runs `mvn spring-boot:run` (backend) or `npm start` (frontend) to confirm their base is clean
> 3. Read your own section completely before writing a single line of code
>
> **Rule for today:** Every time someone finishes a file, they push to `dev` immediately and message Fahim. Nobody moves to the next file without Fahim's confirmation.
>
> **Important reminder:** All entity ID fields must use `Integer` not `Long`. This was the bug we fixed earlier. Do not use `Long` anywhere for IDs.

---

## 📋 Overview — Who Builds What Today

| Person | Files to Build | Depends On |
|---|---|---|
| Tejas | `Notification.java` entity fixes + `StudentProfileDTO.java` | Pull from dev first |
| Aishwarya D S | `StudentService.java` | Tejas must push StudentProfileDTO first |
| B S Aishwarya | `EmployerProfileDTO.java` + `EmployerService.java` | Nothing — start immediately |
| Manoj | `StudentController.java` | Aishwarya DS must push StudentService first |
| Fahim | Review + `GlobalExceptionHandler.java` + Postman testing | All 4 above must push first |
| FE-1 | Wire Login + Register pages to backend API | Nothing — start immediately |
| FE-2 | `StudentDashboard.jsx` + `StudentProfilePage.jsx` | Nothing — start immediately |
| FE-3 | `App.jsx` router + `ProtectedRoute.jsx` + `AuthContext.js` | Nothing — start immediately |

---

> ## ⚠️ Before Anyone Writes Code — Remaining Audit Fixes
>
> These are quick fixes from the audit document. Each person applies the fix to their OWN entity file before starting new work today.
>
> **Aishwarya DS** — Open `Student.java`. Check if `nullable = false` is still present on `fullName`, `usn`, `branch`, `passingYear`. If yes, remove it. These 4 fields must be nullable.
>
> **B S Aishwarya** — Open `Employer.java`. Remove `nullable = false` from `companyName`, `companyDescription`, `createdAt`.
>
> **Fahim** — Open `Job.java`. Remove `@AllArgsConstructor`. Remove `nullable = false` from `jobDescription` and `jobLocation`.
>
> **Manoj** — Open `Application.java`. Add `nullable = false` to the `student`, `job`, `resume` JoinColumn annotations and the `status` column.
>
> **Tejas** — Open `StudentAnalyticsRepository.java`, `StudentRepository.java`, `ResumeRepository.java`. Change `Long` to `Integer` as the JPA type parameter in all three.
>
> Everyone pushes their fix to dev before starting their main task. Message Fahim when done.

---
---

# 👤 TEJAS — Repository Fixes + StudentProfileDTO

## Your Task Today
You have two jobs today. First, fix 3 repository files. Second, build 1 DTO file.

## What is a Profile DTO?
When a student fills in their profile — name, branch, CGPA etc. — that data arrives as a JSON body in a PUT request. Your DTO defines the exact shape of that JSON. It is the "mold" the data must fit into.

---

## Job 1 — Fix 3 Repository Files (Do this FIRST — 10 minutes)

### Fix 1 — `StudentRepository.java`
Open the file. Find this line:
```java
public interface StudentRepository extends JpaRepository<Student, Long>
```
Change `Long` to `Integer`:
```java
public interface StudentRepository extends JpaRepository<Student, Integer>
```

### Fix 2 — `ResumeRepository.java`
Same fix:
```java
// BEFORE:
public interface ResumeRepository extends JpaRepository<Resume, Long>

// AFTER:
public interface ResumeRepository extends JpaRepository<Resume, Integer>
```

### Fix 3 — `StudentAnalyticsRepository.java`
Same fix:
```java
// BEFORE:
public interface StudentAnalyticsRepository extends JpaRepository<StudentAnalytics, Long>

// AFTER:
public interface StudentAnalyticsRepository extends JpaRepository<StudentAnalytics, Integer>
```

After all 3 fixes — run `mvn spring-boot:run`. Must start cleanly. Then push:
```bash
git add backend_pat
git commit -m "fix: correct repository ID types from Long to Integer"
git push origin dev
```
Message in group: **"Repository fixes pushed ✅"**

---

## Job 2 — `StudentProfileDTO.java`

**Where to create it:**
`src/main/java/com/pat/backend_pat/dto/StudentProfileDTO.java`

**What this file does:**
This DTO carries the data when a student updates their profile. It maps the JSON body of the PUT /students/profile request into a Java object.

**Approach to write this with AI:**
```
I am building a Spring Boot 4 REST API.
Create a DTO class called StudentProfileDTO
inside package com.pat.backend_pat.dto

Requirements:
- Use Lombok @Data, @NoArgsConstructor, @AllArgsConstructor
- Fields:
    String fullName       → @NotBlank
    String phoneNumber    → no validation
    String usn            → @NotBlank
    String branch         → @NotBlank
    BigDecimal cgpa       → @DecimalMin("0.0") @DecimalMax("10.0") — optional field
    Integer backlogCount  → @Min(0) — optional field
    Integer passingYear   → no validation
    String skills         → no validation
    String projects       → no validation
    String linkedinUrl    → no validation
    String githubUrl      → no validation
- Use Jakarta validation (jakarta.validation.constraints)
- cgpa and backlogCount are optional — do not mark as @NotNull
```

**What the final file should look like:**
```java
package com.pat.backend_pat.dto;

import jakarta.validation.constraints.DecimalMax;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StudentProfileDTO {

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String phoneNumber;

    @NotBlank(message = "USN is required")
    private String usn;

    @NotBlank(message = "Branch is required")
    private String branch;

    @DecimalMin(value = "0.0", message = "CGPA must be at least 0.0")
    @DecimalMax(value = "10.0", message = "CGPA must not exceed 10.0")
    private BigDecimal cgpa;

    @Min(value = 0, message = "Backlog count cannot be negative")
    private Integer backlogCount;

    private Integer passingYear;
    private String skills;
    private String projects;
    private String linkedinUrl;
    private String githubUrl;
}
```

**How to verify your file is correct:**
- Zero red underlines in Eclipse
- `@DecimalMin` and `@DecimalMax` are imported from `jakarta.validation.constraints` — not `javax`
- Run `mvn spring-boot:run` — must still start cleanly

## Git Instructions (Tejas)
```bash
git add backend_pat
git commit -m "feat: add StudentProfileDTO"
git push origin dev
```
Message in group: **"StudentProfileDTO pushed ✅"**

---
---

# 👤 AISHWARYA D S — StudentService.java

## ⚠️ WAIT BEFORE STARTING
**Do not start until Tejas pushes StudentProfileDTO and you have pulled:**
```bash
git pull origin dev
```
Confirm you can see `dto/StudentProfileDTO.java` before proceeding.

---

## Your Task Today
You are building the business logic for student profile management. This service handles: fetching a student's profile, updating their profile, and uploading a resume.

## What is a Service? (Read this before coding)
A Service class sits between the Controller (which receives HTTP requests) and the Repository (which talks to the database). The Service contains the actual business rules — things like "mark profileCompleted as true after all mandatory fields are filled".

---

## File — `StudentService.java`

**Where to create it:**
`src/main/java/com/pat/backend_pat/service/StudentService.java`

**Approach to write this with AI:**
```
I am building a Spring Boot 4 REST API.
Create a class called StudentService
inside package com.pat.backend_pat.service

Requirements:
- Annotate with @Service
- Inject using @RequiredArgsConstructor:
    → StudentRepository (com.pat.backend_pat.repository)
    → ResumeRepository (com.pat.backend_pat.repository)
    → UserRepository (com.pat.backend_pat.repository)
- Student entity is in com.pat.backend_pat.entity
  Fields: studentId (Integer), fullName, phoneNumber, usn, branch,
  cgpa (BigDecimal), backlogCount (Integer), passingYear (Integer),
  skills, projects, linkedinUrl, githubUrl, profileCompleted (Boolean)
  Relationship: @OneToOne to User via user field
- Resume entity is in com.pat.backend_pat.entity
  Fields: resumeId (Integer), resumeFile (String), uploadedAt (LocalDateTime), isDefault (Boolean)
  Relationship: @ManyToOne to Student via student field
- StudentProfileDTO is in com.pat.backend_pat.dto
- User entity is in com.pat.backend_pat.entity — has userId (Integer) field

- Method 1: getProfile(Integer userId) returns Student
    → Find student by userId: use studentRepository.findByUserUserId(userId)
    → If not found: throw RuntimeException("Student profile not found")
    → Return the student object

- Method 2: updateProfile(Integer userId, StudentProfileDTO dto) returns Student
    → Find student by userId (same as above)
    → Update ALL fields from dto onto the student object:
       student.setFullName(dto.getFullName())
       student.setPhoneNumber(dto.getPhoneNumber())
       ... and so on for all fields
    → After updating all fields, set student.setProfileCompleted(true)
    → Save and return: return studentRepository.save(student)

- Method 3: uploadResume(Integer userId, String filePath) returns Resume
    → Find student by userId
    → Create new Resume object
    → Set resume.setStudent(student)
    → Set resume.setResumeFile(filePath)
    → Set resume.setUploadedAt(LocalDateTime.now())
    → Set resume.setIsDefault(false)
    → Save and return: return resumeRepository.save(resume)

- Method 4: getResumes(Integer userId) returns List<Resume>
    → Find student by userId
    → Return resumeRepository.findByStudentStudentId(student.getStudentId())

- Annotate all methods with @Transactional
```

**Important note for your AI prompt:**
Add this to your prompt so the AI generates the correct repository method:
```
Also add this method to StudentRepository.java:
Optional<Student> findByUserUserId(Integer userId);
```
Add it to the existing `StudentRepository.java` file — do not create a new one.

**How to verify your file is correct:**
- Zero red underlines in Eclipse
- `findByUserUserId` method exists in `StudentRepository.java`
- Run `mvn spring-boot:run` — must start cleanly

## What to Do If You Get an Error
- **`findByUserUserId` not found** → Open `StudentRepository.java` and manually add: `Optional<Student> findByUserUserId(Integer userId);`
- **`LocalDateTime` import missing** → Add `import java.time.LocalDateTime;` at the top of the file
- **Circular dependency error** → Tell Fahim immediately, do not try to fix alone

## Git Instructions (Aishwarya DS)
```bash
git add backend_pat
git commit -m "feat: add StudentService with profile and resume methods"
git push origin dev
```
Message in group: **"StudentService pushed ✅"**

---
---

# 👤 B S AISHWARYA — EmployerProfileDTO + EmployerService

## Your Task Today
You are building the employer profile DTO and service. Since you built the Employer entity, you know it best. This is the natural next step for your module.

---

## File 1 of 2 — `EmployerProfileDTO.java`

**Where to create it:**
`src/main/java/com/pat/backend_pat/dto/EmployerProfileDTO.java`

**What this file does:**
When an employer fills in their company profile (company name, description), this DTO carries that data from the frontend to the backend.

**Approach to write this with AI:**
```
I am building a Spring Boot 4 REST API.
Create a DTO class called EmployerProfileDTO
inside package com.pat.backend_pat.dto

Requirements:
- Use Lombok @Data, @NoArgsConstructor, @AllArgsConstructor
- Fields:
    String companyName        → @NotBlank
    String companyDescription → no validation (optional)
- Use Jakarta validation (jakarta.validation.constraints)
```

**What the final file should look like:**
```java
package com.pat.backend_pat.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class EmployerProfileDTO {

    @NotBlank(message = "Company name is required")
    private String companyName;

    private String companyDescription;
}
```

---

## File 2 of 2 — `EmployerService.java`

**Where to create it:**
`src/main/java/com/pat/backend_pat/service/EmployerService.java`

**Approach to write this with AI:**
```
I am building a Spring Boot 4 REST API.
Create a class called EmployerService
inside package com.pat.backend_pat.service

Requirements:
- Annotate with @Service
- Inject using @RequiredArgsConstructor:
    → EmployerRepository (com.pat.backend_pat.repository)
- Employer entity is in com.pat.backend_pat.entity
  Fields: employerId (Integer), companyName, companyDescription,
  approvedStatus (Boolean)
  Relationship: @OneToOne to User via user field, user has userId (Integer)
- EmployerProfileDTO is in com.pat.backend_pat.dto

- Method 1: getProfile(Integer userId) returns Employer
    → Find employer: use employerRepository.findByUserUserId(userId)
    → If not found: throw RuntimeException("Employer profile not found")
    → Return the employer object

- Method 2: updateProfile(Integer userId, EmployerProfileDTO dto) returns Employer
    → Find employer by userId
    → Set employer.setCompanyName(dto.getCompanyName())
    → Set employer.setCompanyDescription(dto.getCompanyDescription())
    → Save and return: return employerRepository.save(employer)

- Annotate all methods with @Transactional

Also add this method to EmployerRepository.java (do not create a new file):
Optional<Employer> findByUserUserId(Integer userId);
```

**How to verify your file is correct:**
- Zero red underlines in Eclipse
- `findByUserUserId` method exists in `EmployerRepository.java`
- Run `mvn spring-boot:run` — must start cleanly

## Git Instructions (B S Aishwarya)
```bash
git add backend_pat
git commit -m "feat: add EmployerProfileDTO and EmployerService"
git push origin dev
```
Message in group: **"EmployerService pushed ✅"**

---
---

# 👤 MANOJ — StudentController.java

## ⚠️ WAIT BEFORE STARTING
**Do not start until Aishwarya DS pushes StudentService and you have pulled:**
```bash
git pull origin dev
```
Confirm you can see `service/StudentService.java` before proceeding.

---

## Your Task Today
You are building the REST API endpoints for student profile operations. The controller receives HTTP requests and calls the service. It is the entry point that Postman and React will call.

## What is a Controller? (Read this before coding)
Think of a controller as a receptionist. When an HTTP request arrives, the controller receives it, hands the data to the service to process, and sends the response back to the caller. Controllers never contain business logic — they just route and respond.

---

## File — `StudentController.java`

**Where to create it:**
`src/main/java/com/pat/backend_pat/controller/StudentController.java`

**Approach to write this with AI:**
```
I am building a Spring Boot 4 REST API.
Create a class called StudentController
inside package com.pat.backend_pat.controller

Requirements:
- Annotate with @RestController and @RequestMapping("/api/v1/students")
- Inject StudentService using @RequiredArgsConstructor
- All endpoints require authentication (JWT token in Authorization header)
- Extract the current user's ID from the JWT token using SecurityContextHolder:
    String email = SecurityContextHolder.getContext().getAuthentication().getName();
    Then find the user by email to get userId — inject UserRepository for this

- Endpoint 1: GET /students/profile
    → Method name: getProfile
    → No request body
    → Extract userId from security context
    → Call studentService.getProfile(userId)
    → Return ResponseEntity 200 OK with the Student object
    → Wrap in try/catch — return 404 if RuntimeException

- Endpoint 2: PUT /students/profile
    → Method name: updateProfile
    → Takes @Valid @RequestBody StudentProfileDTO
    → Extract userId from security context
    → Call studentService.updateProfile(userId, dto)
    → Return ResponseEntity 200 OK with updated Student
    → Wrap in try/catch — return 400 if RuntimeException

- Endpoint 3: POST /students/resume
    → Method name: uploadResume
    → Takes @RequestParam String filePath
    → Extract userId from security context
    → Call studentService.uploadResume(userId, filePath)
    → Return ResponseEntity 201 CREATED with the Resume object
    → Wrap in try/catch — return 400 if RuntimeException

- Endpoint 4: GET /students/resumes
    → Method name: getResumes
    → No request body
    → Extract userId from security context
    → Call studentService.getResumes(userId)
    → Return ResponseEntity 200 OK with List of Resume objects

- DTOs are in com.pat.backend_pat.dto
- StudentService is in com.pat.backend_pat.service
- UserRepository is in com.pat.backend_pat.repository
```

**Critical note — how to get userId from the token:**
```java
// Add this private helper method inside the controller:
private Integer getCurrentUserId() {
    String email = SecurityContextHolder.getContext()
                       .getAuthentication().getName();
    User user = userRepository.findByEmail(email)
                    .orElseThrow(() -> new RuntimeException("User not found"));
    return user.getUserId();
}
```
Call `getCurrentUserId()` at the start of each endpoint method.

**How to verify your file is correct:**
- Zero red underlines in Eclipse
- Run `mvn spring-boot:run` — must start cleanly
- You cannot fully test until Fahim runs Postman tests

## What to Do If You Get an Error
- **`SecurityContextHolder` not found** → Import: `org.springframework.security.core.context.SecurityContextHolder`
- **`getAuthentication()` returns null** → This means the JWT filter is not running. Tell Fahim — do not debug alone.
- **`UserRepository` injection error** → Make sure you added it to the constructor via `@RequiredArgsConstructor`

## Git Instructions (Manoj)
```bash
git add backend_pat
git commit -m "feat: add StudentController with profile and resume endpoints"
git push origin dev
```
Message in group: **"StudentController pushed ✅"**

---
---

# 👤 FAHIM (Team Lead) — Review + GlobalExceptionHandler + Postman Testing

## Your Responsibilities Today

### Part 1 — Monitor and Review (All day)
After each push from your team:
1. Pull dev: `git pull origin dev`
2. Run `mvn spring-boot:run` — confirm clean build
3. Check for obvious issues in the pushed file
4. If broken: tell the person exactly what to fix before anyone else pulls

### Part 2 — Apply Job.java Audit Fix
Open `Job.java`:
- Remove `@AllArgsConstructor` (keep `@NoArgsConstructor` and `@Builder`)
- Remove `nullable = false` from `jobDescription` and `jobLocation`

Run the app, confirm clean, push.

### Part 3 — GlobalExceptionHandler.java
**Wait until all 4 team members have pushed their files. Then build this.**

**Where to create it:**
`src/main/java/com/pat/backend_pat/config/GlobalExceptionHandler.java`

**Approach to write this with AI:**
```
I am building a Spring Boot 4 REST API.
Create a class called GlobalExceptionHandler
inside package com.pat.backend_pat.config

Requirements:
- Annotate with @RestControllerAdvice
- Handle MethodArgumentNotValidException:
    → Return 400 BAD REQUEST
    → Response body: Map with key "errors" containing list of field error messages
    → Extract messages using: ex.getBindingResult().getFieldErrors()
      format each as: fieldName + ": " + defaultMessage

- Handle RuntimeException:
    → Return 400 BAD REQUEST
    → Response body: Map with key "error" and value ex.getMessage()

- Handle general Exception:
    → Return 500 INTERNAL SERVER ERROR
    → Response body: Map with key "error" and value "An unexpected error occurred"

- All responses return ResponseEntity<Map<String, Object>>
```

### Part 4 — Postman Testing (After GlobalExceptionHandler is pushed)
Run all these tests. All must pass before today is considered done.

**Test 1 — Get Profile Without Token**
```
GET http://localhost:8080/api/v1/students/profile
No Authorization header
Expected: 403 Forbidden
```

**Test 2 — Get Profile With Valid Token**
```
GET http://localhost:8080/api/v1/students/profile
Header: Authorization: Bearer <token from login>
Expected: 200 OK — student object with null fields (profile not filled yet)
```

**Test 3 — Update Student Profile**
```
PUT http://localhost:8080/api/v1/students/profile
Header: Authorization: Bearer <token from login>
Body:
{
  "fullName": "Test Student",
  "usn": "1PA21CS001",
  "branch": "CSE",
  "cgpa": 8.5,
  "backlogCount": 0,
  "passingYear": 2025,
  "skills": "Java, React",
  "projects": "PAT System",
  "phoneNumber": "9876543210"
}
Expected: 200 OK — student object with profileCompleted: true
```

**Test 4 — Update Profile With Missing Required Field**
```
PUT http://localhost:8080/api/v1/students/profile
Header: Authorization: Bearer <token>
Body: { "cgpa": 8.5 }   (missing fullName, usn, branch)
Expected: 400 Bad Request with validation error messages
```

**Test 5 — Upload Resume**
```
POST http://localhost:8080/api/v1/students/resume?filePath=resumes/student1_cv.pdf
Header: Authorization: Bearer <token>
Expected: 201 Created with resume object
```

**Test 6 — Get Resumes**
```
GET http://localhost:8080/api/v1/students/resumes
Header: Authorization: Bearer <token>
Expected: 200 OK with list containing the uploaded resume
```

## Git Instructions (Fahim)
```bash
git add backend_pat
git commit -m "feat: add GlobalExceptionHandler and Job entity audit fixes"
git push origin dev
```

---
---

# 🖥️ FRONTEND TEAM — Today's Tasks

> Frontend team works in parallel with backend today. The backend student profile APIs will be ready by end of day — your job is to build the UI so it's ready to wire up tomorrow.

---

## FE-3 — App.jsx Router + ProtectedRoute + AuthContext

**Start immediately. No dependencies.**

### Task 1 — `src/context/AuthContext.js`

**Approach to write this with AI:**
```
Create a React AuthContext file at src/context/AuthContext.js

Requirements:
- Use React createContext() and useState()
- AuthProvider component stores: token (string), role (string), userId (integer)
- On mount: read token, role, userId from localStorage (they may already be there from a previous session)
- Provide a login(token, role, userId) function:
    → saves all 3 to state AND to localStorage
- Provide a logout() function:
    → clears state to null/empty AND removes from localStorage
- Export AuthContext and AuthProvider
- Wrap children with AuthContext.Provider passing { token, role, userId, login, logout }
```

### Task 2 — `src/components/ProtectedRoute.jsx`

**Approach to write this with AI:**
```
Create a React component called ProtectedRoute at src/components/ProtectedRoute.jsx

Requirements:
- Import useContext from react and AuthContext from ../context/AuthContext
- Import Navigate and Outlet from react-router-dom
- If token exists in AuthContext: render <Outlet /> (show the protected page)
- If token does not exist: redirect to /login using <Navigate to="/login" replace />
```

### Task 3 — `src/App.jsx` (Update the router)

**Approach to write this with AI:**
```
Update src/App.jsx to set up React Router with these routes:

Public routes (no login needed):
- /login → LoginPage
- /register → RegisterPage

Protected routes (wrapped in ProtectedRoute — redirect to /login if no token):
- /student/dashboard → StudentDashboard (placeholder component for now)
- /student/profile → StudentProfilePage (placeholder component for now)
- /employer/dashboard → EmployerDashboard (placeholder component for now)
- /admin/dashboard → AdminDashboard (placeholder component for now)

Requirements:
- Use BrowserRouter, Routes, Route from react-router-dom
- Wrap the entire app in AuthProvider from context/AuthContext
- Default route / should redirect to /login
- Create simple placeholder components for the dashboard pages:
  e.g. const StudentDashboard = () => <h1>Student Dashboard</h1>
  Put placeholders in the same App.jsx file for now
```

**Git Instructions (FE-3):**
```bash
git add pat-frontend
git commit -m "feat: add AuthContext, ProtectedRoute, App router setup"
git push origin dev
```
Message in group: **"Router + AuthContext pushed ✅"**

---

## FE-1 — Wire Login + Register Pages to Backend API

**Start immediately. Pull from dev first to get the latest folder structure.**

### Task — Connect `LoginPage.jsx` and `RegisterPage.jsx` to the real backend

The UI for both pages already exists from yesterday. Today you wire them to the real API.

**For LoginPage.jsx — update the submit handler:**

**Approach to write this with AI:**
```
Update the existing LoginPage.jsx to call the real backend API on submit.

Requirements:
- Import axios from 'axios'
- Import useNavigate from 'react-router-dom'
- Import useContext from 'react' and AuthContext from '../context/AuthContext'
- On form submit:
    Step 1: Call POST http://localhost:8080/api/v1/auth/login
            Body: { email, password }
    Step 2: On success (200):
            → Call login(response.data.token, response.data.role, response.data.userId)
              from AuthContext
            → Navigate based on role:
              if role === "STUDENT" → navigate('/student/dashboard')
              if role === "EMPLOYER" → navigate('/employer/dashboard')
              if role === "ADMIN" → navigate('/admin/dashboard')
    Step 3: On error:
            → Set error state to "Invalid email or password"
            → Show error message below the form
- Show a loading state on the button while the API call is in progress
```

**For RegisterPage.jsx — update the submit handler:**

**Approach to write this with AI:**
```
Update the existing RegisterPage.jsx to call the real backend API on submit.

Requirements:
- Import axios from 'axios'
- Import useNavigate from 'react-router-dom'
- On form submit:
    Step 1: Call POST http://localhost:8080/api/v1/auth/register
            Body: { email, password, role }
    Step 2: On success (201):
            → Show success message: "Account created! Please login."
            → Navigate to /login after 1.5 seconds
    Step 3: On error (400):
            → Set error state to the error message from response
            → Show error message below the form
- Role field should be a dropdown with options: student, employer
- Show a loading state on the button while the API call is in progress
```

**How to test your work:**
1. Start the backend on port 8080
2. Start React on port 3000
3. Go to http://localhost:3000/register
4. Register a new student account — should redirect to login
5. Login with that account — should redirect to student dashboard
6. Try wrong password — should show error message

**Git Instructions (FE-1):**
```bash
git add pat-frontend
git commit -m "feat: wire Login and Register pages to backend API"
git push origin dev
```
Message in group: **"Login/Register wired to backend ✅"**

---

## FE-2 — StudentDashboard + StudentProfilePage (UI Only)

**Start immediately. No dependencies.**

### Task 1 — `src/pages/StudentDashboard.jsx`

**Approach to write this with AI:**
```
Create a React functional component called StudentDashboard
at src/pages/StudentDashboard.jsx

Requirements:
- Import useContext from 'react' and AuthContext from '../context/AuthContext'
- Show a welcome message using the userId from AuthContext: "Welcome, Student!"
- Show 3 stat cards (hardcoded for now, we wire real data tomorrow):
    Card 1: "Applications Sent" — value: 0
    Card 2: "Shortlisted" — value: 0
    Card 3: "Interviews Given" — value: 0
- Show a navigation section with links (use <a> tags for now):
    "Complete My Profile" → links to /student/profile
    "Browse Jobs" → links to /student/jobs (placeholder)
    "My Applications" → links to /student/applications (placeholder)
- Show a "Logout" button that calls the logout() function from AuthContext
  and redirects to /login
- Use basic inline styles — no external UI libraries
```

### Task 2 — `src/pages/StudentProfilePage.jsx`

**Approach to write this with AI:**
```
Create a React functional component called StudentProfilePage
at src/pages/StudentProfilePage.jsx

Requirements:
- State for all profile fields:
  fullName, phoneNumber, usn, branch, cgpa, backlogCount,
  passingYear, skills, projects, linkedinUrl, githubUrl
- State for: loading (boolean), error (string), success (string)
- On component mount: fetch existing profile data
    Call GET http://localhost:8080/api/v1/students/profile
    Include Authorization header: "Bearer " + token from localStorage
    Pre-fill form fields with the response data
- Form fields: one input for each profile field
  Use textarea for skills and projects
- Save button: calls PUT http://localhost:8080/api/v1/students/profile
    Include Authorization header
    Body: all profile fields as JSON
    On success: show success message "Profile updated successfully"
    On error: show error message
- Resume upload section below the form:
    File input (accept=".pdf")
    Upload button: for now just console.log the file name
    (actual upload wiring happens tomorrow)
- Show loading spinner while fetching or saving
- Use basic inline styles — no external UI libraries
```

**Git Instructions (FE-2):**
```bash
git add pat-frontend
git commit -m "feat: add StudentDashboard and StudentProfilePage UI"
git push origin dev
```
Message in group: **"StudentDashboard + ProfilePage pushed ✅"**

---
---

## 📌 End of Day — Definition of Done

Confirm all of these to Fahim before ending today:

**Backend:**
- [ ] Repository ID types fixed (Integer not Long) in StudentRepository, ResumeRepository, StudentAnalyticsRepository
- [ ] Audit fixes applied: Student.java nullable, Employer.java nullable, Job.java @AllArgsConstructor removed, Application.java nullable = false added
- [ ] `dto/StudentProfileDTO.java` exists
- [ ] `dto/EmployerProfileDTO.java` exists
- [ ] `service/StudentService.java` exists with 4 methods
- [ ] `service/EmployerService.java` exists with 2 methods
- [ ] `controller/StudentController.java` exists with 4 endpoints
- [ ] `config/GlobalExceptionHandler.java` exists
- [ ] `findByUserUserId()` method added to both StudentRepository and EmployerRepository
- [ ] All 6 Postman tests pass (listed in Fahim's section)
- [ ] Everything pushed to `dev` branch

**Frontend:**
- [ ] `context/AuthContext.js` created with login/logout functions
- [ ] `components/ProtectedRoute.jsx` created
- [ ] `App.jsx` updated with proper routes — protected and public
- [ ] `LoginPage.jsx` calls real backend API and redirects on success
- [ ] `RegisterPage.jsx` calls real backend API
- [ ] `StudentDashboard.jsx` renders with stat cards and navigation
- [ ] `StudentProfilePage.jsx` renders form with all fields
- [ ] End to end flow works: Register → Login → Student Dashboard → Profile Page

> **Only when ALL backend Postman tests pass, message the mentor with the results. We will then confirm Phase 2 is complete and move to Phase 3 (Job Posting).**
