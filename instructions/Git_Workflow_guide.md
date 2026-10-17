# PAT Project – Git & Development Workflow Guide

This document explains how the team will work with **Git and GitHub** for the PAT system project.

The purpose of this workflow is to:

* Keep development **simple and fast**
* Avoid unnecessary Git complexity
* Ensure everyone's code stays **synchronized**
* Prevent accidental overwriting of work

This project uses a **two-branch workflow**.

---

# 1. Branch Structure

The repository contains two important branches.

```text
main → Stable version of the project
dev  → Development branch where all coding happens
```

### main branch

* Contains the **stable version** of the project
* Only updated when a feature works completely
* Should always remain **runnable**

### dev branch

* Used for **daily development**
* All developers push their code here
* The entire team collaborates through this branch

Important rule:

```
Never push code directly to main
All development must happen on the dev branch
```

---

# 2. Development Branch (dev)

The `dev` branch has already been created on GitHub by the **team lead**.

Developers **do not need to create this branch themselves**.

The repository structure is therefore:

```text
main → Stable branch
dev  → Development branch used by the entire team
```

All development must happen on the **dev branch**.

---

# 3. Repository Structure

The repository contains the following directories:

```text
PAT_System
│
├── backend_pat       → Spring Boot Backend
├── pat-frontend      → React Frontend
├── instructions      → Project documentation
└── .gitignore
```

Both backend and frontend teams work inside the **same repository**.

---

# 4. One-Time Setup (For New Developers)

If you are cloning the project for the first time, follow these steps.

### Step 1 — Clone the repository

```bash
git clone <repository-url>
```

Example:

```bash
git clone https://github.com/your-team/PAT_System.git
```

---

### Step 2 — Enter the project directory

```bash
cd PAT_System
```

---

### Step 3 — Switch to the dev branch

All development happens on the `dev` branch.

```bash
git checkout dev
```

If Git shows an error saying the branch does not exist locally, run:

```
git checkout -b dev
```

This creates a **local copy of the dev branch** that tracks the remote branch.

---

### Step 4 — Pull the latest code

```bash
git pull origin dev
```

This ensures your system has the **latest version of the project**.

---

# 5. If You Have Already Cloned the Repository

Some team members may have cloned the project earlier.

Follow these steps to move to the new workflow.

### Step 1 — Fetch the latest branch information

```bash
git fetch
```

---

### Step 2 — Switch to the dev branch

```bash
git checkout dev
```

If Git shows an error saying the branch does not exist locally, run:

```bash
git checkout -b dev
```

This creates a **local copy of the dev branch** that tracks the remote branch.

---

### Step 3 — Update your project

```bash
git pull origin dev
```

Now your local project matches the development branch.

---

# 6. Daily Development Workflow

Every developer must follow this process when working.

---

## Step 1 — Update your local project

Before writing any code run:

```bash
git checkout dev
git pull origin dev
```

Why?

Other developers may have pushed updates. Pulling first prevents **merge conflicts**.

---

## Step 2 — Work on your assigned files

Each developer should only modify the files assigned to them.

Example backend files:

```text
entity/User.java
repository/UserRepository.java
service/AuthService.java
controller/AuthController.java
```

Example frontend files:

```text
src/pages/LoginPage.jsx
src/components/InputField.jsx
src/services/api.js
src/context/AuthContext.jsx
```

Avoid editing files owned by other developers unless necessary.

---

## Step 3 — Test your changes

Before committing, make sure your code works.

Backend:

```bash
./mvnw spring-boot:run
```

Frontend:

```bash
npm run dev
```

Never push code that breaks the project.

---

## Step 4 — Stage your changes

Tell Git which files should be included in the commit.

```bash
git add .
```

---

## Step 5 — Commit your changes

Create a commit with a clear message.

```bash
git commit -m "Implement login service"
```

Examples:

```
Add UserRepository
Implement AuthService
Create login page UI
Add API integration
```

---

## Step 6 — Push your code

Upload your changes to GitHub.

```bash
git push origin dev
```

Now the rest of the team can pull your updates.

---

# 7. Important Team Rules

To avoid conflicts and broken builds, follow these rules.

### Rule 1

Always run:

```bash
git pull origin dev
```

before starting work.

---

### Rule 2

Push your work regularly.

Do not keep large changes locally for long periods.

---

### Rule 3

Avoid modifying someone else's files without informing them.

---

### Rule 4

Test your code before pushing.

Never push code that breaks the project.

---

# 8. When Do We Use the Main Branch?

The `main` branch represents a **stable version of the project**.

We update `main` only when a major feature is complete.

**NOTE : The merging of *****dev***** branch into *****main***** branch done only by the Team Lead**

Example milestone:

```
Authentication system completed
Frontend login connected to backend
```

Then the team lead merges:

```bash
git checkout main
git pull origin main
git merge dev
git push origin main
```

This creates a **stable checkpoint** of the project.

---

# 9. Summary

The workflow is simple.

Before coding:

```bash
git checkout dev
git pull origin dev
```

After finishing work:

```bash
git add .
git commit -m "describe your change"
git push origin dev
```

This process keeps the entire team synchronized while maintaining a stable version of the project.
