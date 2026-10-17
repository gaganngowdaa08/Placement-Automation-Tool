# PAT Database Setup

The default local workflow is Docker Compose from the project root. It starts MySQL, applies `database/migrations/002_account_roles.sql` against the current database without dropping tables, then starts the backend.

## Recommended: Docker Compose

1. Ensure `.env` exists in the repository root and contains the same MySQL root/database credentials used when the database volume was first created.
2. Start Docker Desktop and wait for the engine to be ready.
3. From the repository root, run:

   ```powershell
   docker compose up --build
   ```

4. Verify the services:

   ```powershell
   docker compose ps
   ```

The `pat-mysql-data` named volume keeps local database data when the containers stop. Do not run `docker compose down -v` unless you intend to delete both database and resume-upload data.

## Create a brand-new development database manually

Use this section only for an empty/new local MySQL instance. The schema file contains `DROP TABLE IF EXISTS` statements. It is destructive if run against an existing `pat_system` database that contains records you need to preserve.

```bash
mysql -u root -p < database/schema.sql
```

If starting from an older PAT database outside Docker Compose, first back it up, then apply the compatibility migration:

```bash
mysql -u root -p pat_system < database/migrations/002_account_roles.sql
```

The migration widens the account role field to support `student`, `college`, and `company`, adds compatibility fields when missing, and creates the college profile table without dropping existing users.

## Tables used by the current workflows

- `users`: account email, password hash, contact details, and role.
- `students` and `student_academic`: student profile and education information.
- `college_profiles`: college / institution profile.
- `employers` and `jobs`: company profiles and live job postings.
- `resumes`: resume file location and metadata; the PDF bytes are stored in the configured upload directory / Docker volume.
- `applications`: student application records linked to a real job and saved resume.

For local troubleshooting, inspect the backend logs with `docker compose logs -f backend` and the database logs with `docker compose logs -f mysql`.
