# PAT Project – Day 2 Task Board

Date: March 18

Phase: **Phase 1 – Data Layer Completion**
Goal: Complete ALL remaining entities and repositories so backend fully matches database schema.

---

# Global Team Learning Rule (Mandatory)

Every developer must follow this process when using AI.

1. Generate code with AI.
2. Ask AI to explain every annotation or unfamiliar concept.
3. Write a **5-line summary** in the shared team learning document.

If a developer cannot explain the code they added, it should not be committed.

---

# Backend Tasks (5 Developers)

## Objective Today

Complete ALL remaining entities and repositories:

* Notification
* Resume
* StudentAnalytics
* RecruitmentRound
* RoundResult

Success criteria:

* Application runs successfully
* All 10 tables created in DB
* All relationships compile

---

## Backend Dev 1 (User Module Dev) – Notification Module

### Total Tasks for the Day

1. Create Notification entity
2. Implement relationship with User
3. Create NotificationRepository
4. Verify table creation

### Tasks

Create:

```
Notification.java
NotificationRepository.java
```

Fields:

```
notificationId
user
message
isRead
createdAt
```

Relationship:

```
@ManyToOne User
```

### AI Prompt Example

```
Create a Notification entity for a Spring Boot placement portal.

Phase: Data layer completion.

Fields:
- notificationId
- user (ManyToOne relationship with User)
- message
- isRead
- createdAt

Use JPA and Lombok.
Explain every annotation line by line and give final code.
```

---

## Backend Dev 2 (Student Module Dev) – Resume + Student Analytics Modules

### Total Tasks for the Day

1. Create Resume entity
2. Implement relationship with Student
3. Create ResumeRepository
4. Create StudentAnalytics entity
5. Implement relationship with Student
6. Create StudentAnalyticsRepository
7. Verify table creation for both

### Tasks

Create:

```
Resume.java
ResumeRepository.java
StudentAnalytics.java
StudentAnalyticsRepository.java
```

Resume Fields:

```
resumeId
student
resumeFile
uploadedAt
isDefault
```

Relationship:

```
@ManyToOne Student
```

StudentAnalytics Fields:

```
student
applicationsCount
shortlistedCount
interviewsGiven
```

Relationship:

```
@OneToOne Student
```

### AI Prompt Example

```
Create Resume and StudentAnalytics entities for a Spring Boot placement system.

Phase: data layer completion.

Resume Fields:
- resumeId
- student (ManyToOne)
- resumeFile
- uploadedAt
- isDefault

StudentAnalytics Fields:
- student (OneToOne)
- applicationsCount
- shortlistedCount
- interviewsGiven

Use JPA and Lombok.
Explain all annotations clearly and give final code.
```

---

## Backend Dev 3 – Student Analytics Module

### Total Tasks for the Day

1. Create StudentAnalytics entity
2. Implement relationship with Student
3. Create StudentAnalyticsRepository
4. Verify table creation

### Tasks

Create:

```
StudentAnalytics.java
StudentAnalyticsRepository.java
```

Fields:

```
student
applicationsCount
shortlistedCount
interviewsGiven
```

Relationship:

```
@OneToOne Student
```

### AI Prompt Example

```
Create a StudentAnalytics entity for a Spring Boot placement system.

Phase: data layer completion.

Fields:
- student (OneToOne relationship)
- applicationsCount
- shortlistedCount
- interviewsGiven

Use JPA and Lombok.
Explain all annotations and give final code.
```

---

## Backend Dev 4 (Job Module Dev) – Recruitment Round Module

### Total Tasks for the Day

1. Create RecruitmentRound entity
2. Implement relationship with Job
3. Create RecruitmentRoundRepository
4. Verify table creation

### Tasks

Create:

```
RecruitmentRound.java
RecruitmentRoundRepository.java
```

Fields:

```
roundId
job
roundName
roundOrder
createdAt
```

Relationship:

```
@ManyToOne Job
```

### AI Prompt Example

```
Create a RecruitmentRound entity for a Spring Boot placement portal.

Phase: data layer completion.

Fields:
- roundId
- job (ManyToOne relationship)
- roundName
- roundOrder
- createdAt

Use JPA and Lombok.
Explain relationships and annotations clearly.
```

---

## Backend Dev 5 (Application Module Dev) – Round Result Module

### Total Tasks for the Day

1. Create RoundResult entity
2. Implement relationships with Application and RecruitmentRound
3. Create RoundResultRepository
4. Verify table creation

### Tasks

Create:

```
RoundResult.java
RoundResultRepository.java
```

Fields:

```
resultId
application
round
status
updatedAt
```

Relationships:

```
@ManyToOne Application
@ManyToOne RecruitmentRound
```

### AI Prompt Example

```
Create a RoundResult entity for a Spring Boot placement portal.

Phase: data layer completion.

Fields:
- resultId
- application (ManyToOne)
- round (ManyToOne)
- status
- updatedAt

Use JPA and Lombok.
Explain each annotation and relationship.
```

---

# Frontend Tasks (3 Developers)

## Objective Today

Prepare UI for resume flow and improve structure.

---

## Frontend Dev 1 – Resume Upload UI

### Total Tasks for the Day

1. Create Resume upload component
2. Add file input UI
3. Style using Tailwind

---

## Frontend Dev 2 – Job UI Improvement

### Total Tasks for the Day

1. Improve job cards UI
2. Prepare layout for API data

---

## Frontend Dev 3 – Dashboard Structure

### Total Tasks for the Day

1. Refactor dashboard layout
2. Prepare reusable components

---

# End-of-Day Milestone

Backend:

* All 10 entities created
* All repositories created
* Relationships compile
* Database fully matches schema

Frontend:

* Resume UI added
* UI improved and structured

If completed, Phase 1 is FULLY COMPLETE.

---

# Mandatory Rule

Before ending the day:

1. Update PAT_MASTER_CHECKLIST.md
2. Verify ALL 10 entities exist
3. Fix any missing mappings

No Phase 2 without full completion.
