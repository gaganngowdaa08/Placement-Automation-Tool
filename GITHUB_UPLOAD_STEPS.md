# Add PAT to your GitHub account

This bundle is prepared for a new repository named `Placement-Automation-Tool`. It does not include `.env`, node modules, Maven build output, or uploaded resume files.

## 1. Create the empty repository

1. Open https://github.com/new while signed in as `gaganngowdaa08`.
2. Name it `Placement-Automation-Tool`.
3. Set visibility to **Private for now**. The source project this adapts has no license file; obtain the original author's permission before publishing the derivative publicly.
4. Do **not** initialize the repository with a README, `.gitignore`, or license. This package already contains project documentation and ignore rules.
5. Create the repository and copy its HTTPS URL. It should look like `https://github.com/gaganngowdaa08/Placement-Automation-Tool.git`.

## 2. Extract and open the project root

Extract `PAT-GitHub-Ready.zip`. Open a terminal in the extracted `Placement-Automation-Tool` folder—the folder containing `docker-compose.yml` and `README.md`.

Make sure your actual local `.env` file is not copied into this bundle or added manually. Do not add real resumes, database dumps, credentials, `node_modules`, or `target` folders.

## 3. Initialize and push

Run these commands from the project root in PowerShell:

```powershell
git init
git branch -M main
git add .
git status --short
```

Before committing, inspect the status output and confirm that `.env`, uploaded PDFs, logs, database dumps, `node_modules`, and `target` directories are not staged. You can ask Git which ignore rule covers a local environment file with:

```powershell
git check-ignore -v .env
```

Then commit and push:

```powershell
git commit -m "Initial commit: Placement Automation Tool"
git remote add origin https://github.com/gaganngowdaa08/Placement-Automation-Tool.git
git push -u origin main
```

If GitHub shows a different repository URL, use the URL copied from the repository page for `git remote add origin`.

## 4. Verify on GitHub

Refresh the new repository page. Check that the root `README.md` displays the project description and that the repository contains `backend_pat/`, `pat-frontend/`, `database/`, `docker-compose.yml`, and `.env.example`.

The GitHub repository stores the source code and documentation; it does not, by itself, publish the live application. Hosting the app at a public URL is a separate deployment step.
