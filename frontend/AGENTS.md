# AGENTS.md (Frontend)

## Project Overview

This is the frontend of the PetMatch application.

* Framework: React (Create React App)
* Architecture: Feature-based structure
* Backend: Node.js + Express API running on http://localhost:3001
* All API routes are under `/api`

This frontend is being refactored from a prototype into a production-ready client.

---

## Project Structure

src/
app/           → app setup (router, providers)
shared/        → reusable components, utils, API client
features/      → feature-based modules (auth, pets, matches, etc.)
mocks/         → temporary mock data (to be removed gradually)

Each feature should contain:

* pages/ → route-level components
* components/ → UI components
* api.js → API calls
* hooks.js → logic/state

---

## Key Rules (VERY IMPORTANT)

### DO

* Use feature-based structure (no large monolithic files)
* Keep components small and focused
* Separate UI from logic (use hooks for logic)
* Use the shared `apiClient` for all API calls
* Replace mock data with backend calls progressively
* Use stable IDs (NOT names) for data references
* Keep changes minimal and scoped

### DO NOT

* Do NOT reintroduce a single large App.js
* Do NOT store business logic inside JSX
* Do NOT hardcode data (pets, matches, messages)
* Do NOT call fetch directly inside components
* Do NOT add new libraries without justification
* Do NOT break existing folder structure

---

## Routing

Use React Router.

Main routes:

/login
/signup
/onboarding/pet
/home
/discover
/matches
/matches/:matchId/chat
/profile
/profile/pets/:petId/edit
/settings
/settings/preferences
/settings/notifications
/settings/privacy

---

## API Integration

### Base URL

http://localhost:3001/api

### API Client

All requests must go through:

src/shared/lib/apiClient.js

Example:

```js
apiFetch("/auth/login", {
  method: "POST",
  body: JSON.stringify(data)
});
```

---

## Backend Alignment

Frontend must match backend domains:

* auth
* pets
* discovery
* likes
* matches
* chat (later)
* settings

Do not invent new data structures if backend already defines them.

---

## Data Models (Frontend Expectations)

### User

* id
* email

### Pet

* id
* name
* type
* breed
* age
* ownerId

### Match

* id
* petIds[]
* createdAt

### Message (future)

* id
* conversationId
* senderId
* content
* timestamp

---

## State Management

* Use local state (`useState`) for UI state
* Use hooks for feature logic
* Prepare for server state (React Query later)

---

## Migration Strategy (IMPORTANT)

Refactor and integrate in this order:

1. Auth (login/signup)
2. Pet onboarding & profile pets
3. Discovery (browse pets)
4. Likes & matches
5. Chat (last)

Do NOT implement everything at once.

---

## Commands

Run frontend:

npm install
npm start

---

## Development Rules

* Always preserve working functionality
* Prefer incremental refactors over rewrites
* Do not modify unrelated features
* Keep diffs small and readable

---

## Good Patterns

* Feature folders (features/auth, features/pets, etc.)
* Hooks for logic (useAuth, useDiscovery, etc.)
* Shared API client
* Clear separation between UI and data

---

## Bad Patterns (Avoid)

* Giant components (>300 lines)
* Mixing navigation, state, and UI in one file
* Hardcoded arrays for pets/matches
* Keying data by name instead of ID

---

## Goal

Transform the frontend from:
→ prototype (local state, mock data)

into:
→ real client connected to backend API

---

## Notes for Codex

* Prefer editing existing files over creating duplicates
* If refactoring, move code instead of rewriting blindly
* Ask for clarification if backend API is unclear
* Always align with existing backend models

---
