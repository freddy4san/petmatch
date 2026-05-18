# AGENTS.md

## Repo Overview

PetMatch is a full-stack pet discovery and matching application.

- `server/` is the backend.
- `frontend/` is the frontend.
- Backend stack: Express, Prisma, PostgreSQL/Neon, Zod, JWT, Socket.IO.
- Frontend stack: React/Create React App, Tailwind CSS, Socket.IO client.
- Image storage: Cloudinary. Do not store image binaries in PostgreSQL.
- Backend routes are mounted under `/api`.
- Local frontend API base should target `http://localhost:3001/api`.
- Production frontend API base should target the Render backend `/api` URL.

## Development Principles

- Keep changes incremental and scoped.
- Do not rewrite architecture.
- Preserve existing API routes and frontend behaviour unless the task explicitly asks for a breaking change.
- Prefer small focused PRs over broad refactors.
- Do not modify unrelated code.
- Inspect existing project patterns before adding abstractions.
- Do not add production dependencies unless needed; explain why in the change summary.
- Do not change the database schema unless the task explicitly asks for it.
- Do not change both `server/` and `frontend/` in the same implementation step unless explicitly asked or the API/data contract requires it.
- If backend API behaviour or response shape changes, update `server/docs/frontend-contract.md`.
- For frontend API integration, align with actual mounted backend routes.

## Install And Commands

This repo uses npm. Both packages have `package-lock.json`; there is no root package script.

Backend:

```bash
cd server
npm install
npm run dev
npm start
npm test
```

- `npm run dev` runs `nodemon src/server.js`.
- `npm start` runs `node src/server.js`.
- `npm test` runs `node --test`.

Frontend:

```bash
cd frontend
npm install
npm start
npm run build
npm test
```

- `npm start` runs `react-scripts start`.
- `npm run build` runs `react-scripts build`.
- `npm test` runs `react-scripts test`.
- There is no frontend lint script currently.

## Verification Rules

- After backend changes, run `npm test` from `server/`, or the closest available backend test command if scripts change.
- After frontend changes, run `npm run build` from `frontend/`; run lint too if a lint script is later added.
- For frontend test runs, prefer a non-watch invocation when possible, for example `CI=true npm test -- --watchAll=false`.
- Add tests before changing security-sensitive code when possible.
- Security-sensitive areas include authentication, password handling, JWT/session logic, authorization/ownership checks, upload/delete flows, CORS, validation, and rate-limit or abuse controls.
- If a command cannot be run because of missing environment variables or external services, document that clearly in the final notes.

## Backend Agreements

- Backend-only changes should stay inside `server/`.
- Keep controllers thin; business logic belongs in services.
- Use Prisma for database access unless there is a specific reason not to.
- Use existing Zod validation patterns for request bodies, params, and query strings.
- Preserve the existing response style and status-code semantics.
- Keep private routes protected by auth middleware.
- Never expose passwords, password hashes, tokens, or internal errors.
- Enforce ownership before pet mutation, image upload replacement, image deletion, or other user-owned resource changes.
- Prefer upload new asset -> persist database update -> delete old Cloudinary asset for replacements, so users are not left with broken image states.

## Frontend Agreements

- Frontend-only changes should stay inside `frontend/`.
- Preserve the feature-based structure and existing route behaviour.
- Use the shared API client instead of direct `fetch` calls in components.
- Do not reintroduce hardcoded mock data where backend-backed data already exists.
- Keep UI changes focused on the requested workflow.
- Do not invent frontend data shapes when the backend already defines the contract.

## Media Handling

- Images are stored in Cloudinary, not in PostgreSQL.
- PostgreSQL stores image metadata and Cloudinary references.
- Do not store only a raw image URL when delete/replace flows require stable identifiers.
- Frontend clients should use backend endpoints for image operations unless the task explicitly designs direct Cloudinary uploads.
- When implementing image CRUD, decide first whether images remain fields on `Pet` or become a dedicated `PetImage` model.

## Order Of Work

1. Explore current code paths and package scripts.
2. Plan the smallest safe change.
3. Add or update tests first when changing security-sensitive behaviour and it is practical.
4. Implement backend first when API/data shape changes.
5. Update frontend only after the backend contract is clear.
6. Run the relevant verification commands.
7. Summarize changed files, tests run, and any known follow-up.

## Existing Nested Instructions

- Also read and follow `server/AGENTS.md` for work inside `server/`.
- Also read and follow `frontend/AGENTS.md` for work inside `frontend/`.
- If nested instructions conflict with this root file, prefer the more specific nested instructions for files in that subtree unless the user gives a newer explicit instruction.
