# PetMatch

PetMatch is a full-stack pet discovery and matching application. Users can create authenticated accounts, manage pet profiles, upload pet images, browse a discovery feed, like or pass on other pets, automatically match on reciprocal likes, and message matched owners through REST-based conversations.

The project is built as a production-style portfolio application with a React frontend, an Express API, a Prisma/PostgreSQL data layer, Cloudinary-backed media handling, and deployment paths for Vercel, Render, Neon, and Cloudinary.

## Architecture

```text
petmatch/
  frontend/    React client application
  server/      Express API, Prisma schema, migrations, and services
```

### Frontend

The frontend is a React application organized by feature area. API requests go through a shared API client and target the backend under `/api`.

Key areas:

- `features/auth` - signup, login, session handling, and current user flow
- `features/pets` - pet CRUD, image validation, and image upload integration
- `features/discovery` - discovery feed API integration and browsing UI
- `features/interactions` - like/pass actions
- `features/matches` - matches, conversations, and REST chat UI
- `shared/lib/apiClient.js` - shared fetch wrapper and API base URL handling

### Backend

The backend is an Express API mounted under `/api`. It uses route/controller/service layers so request handling, validation, authorization, and business logic stay separated.

Backend responsibilities include:

- JWT authentication and protected routes
- ownership checks for pet mutations and image operations
- Zod request validation
- Prisma database access
- Cloudinary upload/delete coordination
- match creation from reciprocal likes
- conversation and message persistence

### Database

PostgreSQL stores relational application data through Prisma. The core models are:

- `User`
- `Pet`
- `Interaction`
- `Match`
- `Conversation`
- `Message`

Interactions represent a source pet responding to a target pet with `LIKE` or `PASS`. A reciprocal `LIKE` creates a canonical match between the two pets, and the backend ensures a conversation exists for that match.

### Images

Pet images are stored in Cloudinary, not in PostgreSQL. The database stores image metadata and Cloudinary references such as URL, public ID, asset ID, dimensions, format, and upload timestamp.

The backend owns image upload, replacement, and deletion so it can enforce pet ownership and avoid broken image states. Frontend clients upload image files to the backend rather than writing directly to Cloudinary.

## Implemented Features

- User signup, login, JWT session storage, and current user loading
- Authenticated pet CRUD
- Pet image upload, replacement, and deletion through Cloudinary
- Discovery feed with pagination support and selected source pet filtering
- Like/pass interactions between pets
- Duplicate interaction handling and conflict responses
- Automatic match creation on reciprocal likes
- Conversation creation for matched pets
- REST-based message listing and sending
- Health checks for API and database connectivity
- Frontend API integration through a shared client
- Backend and frontend test coverage for key flows

## Tech Stack

### Frontend

- React
- Create React App
- Tailwind CSS
- Lucide React icons
- REST API integration

### Backend

- Node.js
- Express
- Prisma ORM
- PostgreSQL
- Zod
- JSON Web Tokens
- bcrypt
- Multer
- Cloudinary

### Infrastructure

- Render for the backend API
- Vercel for the frontend
- Neon for hosted PostgreSQL
- Cloudinary for image storage

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/freddy4san/petmatch.git
cd petmatch
```

### 2. Backend setup

```bash
cd server
npm install
```

Create `server/.env`:

```bash
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="7d"
PORT=3001
CORS_ALLOWED_ORIGINS="http://localhost:3000"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
CLOUDINARY_UPLOAD_FOLDER="petmatch/pets"
```

Run Prisma migrations:

```bash
npx prisma migrate dev
```

Optional seed:

```bash
npx prisma db seed
```

Start the backend:

```bash
npm run dev
```

The backend runs at:

```text
http://localhost:3001
```

The local API base URL is:

```text
http://localhost:3001/api
```

### 3. Frontend setup

In a second terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```bash
REACT_APP_API_BASE_URL="http://localhost:3001/api"
```

Start the frontend:

```bash
npm start
```

The frontend runs at:

```text
http://localhost:3000
```

### 4. Tests

Backend:

```bash
cd server
npm test
```

Frontend:

```bash
cd frontend
npm test
```

Frontend production build:

```bash
cd frontend
npm run build
```

## Deployment Setup

### Neon PostgreSQL

1. Create a Neon project and database.
2. Copy the pooled or direct PostgreSQL connection string.
3. Set it as `DATABASE_URL` in Render.
4. Run production migrations from the backend environment:

```bash
npx prisma migrate deploy
```

### Cloudinary

1. Create a Cloudinary account and media cloud.
2. Create or copy the API credentials.
3. Set these backend environment variables in Render:

```bash
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
CLOUDINARY_UPLOAD_FOLDER="petmatch/pets"
```

### Render Backend

Create a Render web service for the `server` directory.

Recommended settings:

- Root directory: `server`
- Build command: `npm install && npx prisma generate && npx prisma migrate deploy`
- Start command: `npm start`

Required environment variables:

```bash
DATABASE_URL="your-neon-postgres-url"
JWT_SECRET="replace-with-a-long-random-secret"
JWT_EXPIRES_IN="7d"
PORT=3001
CORS_ALLOWED_ORIGINS="https://your-vercel-app.vercel.app"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
CLOUDINARY_UPLOAD_FOLDER="petmatch/pets"
```

After deployment, verify:

```text
https://your-render-service.onrender.com/api/health
```

### Vercel Frontend

Create a Vercel project for the `frontend` directory.

Recommended settings:

- Root directory: `frontend`
- Build command: `npm run build`
- Output directory: `build`

Required environment variable:

```bash
REACT_APP_API_BASE_URL="https://your-render-service.onrender.com/api"
```

The frontend must point to the Render backend `/api` URL, and the backend must allow the Vercel origin through `CORS_ALLOWED_ORIGINS`.

## API Overview

All backend routes are served under `/api`.

| Area | Endpoint | Purpose |
| --- | --- | --- |
| Health | `GET /health` | Root health check |
| Health | `GET /api/health` | API/database health check |
| Auth | `POST /api/auth/register` | Create a user account |
| Auth | `POST /api/auth/login` | Login and receive a JWT |
| Auth | `GET /api/auth/me` | Load the authenticated user |
| Pets | `GET /api/pets` | List the current user's pets |
| Pets | `POST /api/pets` | Create a pet |
| Pets | `PATCH /api/pets/:petId` | Update an owned pet |
| Pets | `DELETE /api/pets/:petId` | Delete an owned pet |
| Pet Images | `POST /api/pets/:petId/image` | Upload or replace a pet image |
| Pet Images | `DELETE /api/pets/:petId/image` | Delete a pet image |
| Discovery | `GET /api/discovery` | Browse discoverable pets |
| Interactions | `POST /api/interactions` | Like or pass on a pet |
| Matches | `GET /api/matches` | List matches for the current user's pets |
| Conversations | `GET /api/conversations` | List matched conversations |
| Messages | `GET /api/matches/:matchId/messages` | List messages for a match |
| Messages | `POST /api/matches/:matchId/messages` | Send a message in a match |

Authenticated routes require:

```text
Authorization: Bearer <token>
```

Pet image uploads use `multipart/form-data` with the file field:

```text
image
```

More detailed frontend/backend contract notes are available in `server/docs/frontend-contract.md`.

## Future Improvements

- Add real-time messaging with WebSockets or Server-Sent Events
- Add read receipts and persisted unread conversation counts
- Add location-based discovery and distance filters
- Expand pet images into a dedicated gallery model for multiple images per pet
- Add notifications for new matches and messages
- Add CI checks for backend tests, frontend tests, linting, and production builds
- Improve accessibility and responsive polish across the full UI

## Author

Built by freddy4san and EGonzalezRomero.
