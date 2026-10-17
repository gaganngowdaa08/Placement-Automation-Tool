# PAT Frontend

React 19 + Vite interface for the Placement Automation Tool.

## Requirements

- Node.js version compatible with the Vite version in `package-lock.json`.
- npm.
- The Spring Boot backend available at `http://localhost:8080` for API-backed workflows.

## Commands

Run these from `pat-frontend/`:

```bash
npm ci
npm run dev
npm run lint
npm run build
npm run preview
```

The Vite server normally runs at `http://localhost:5173`. Its development configuration proxies `/api` requests to `http://localhost:8080`.

## Environment

The checked-in `.env.example` uses `VITE_API_BASE_URL=/api`, which is suitable for the local Vite proxy and the Docker/Nginx configuration. For a separately hosted frontend, configure `VITE_API_BASE_URL` to the backend API base URL ending in `/api` before building, and configure the backend CORS allowlist for the exact frontend origin.

Do not commit `.env.local` or any real credentials.
