# AGENTS.md

## Repo overview
PetMatch is a full-stack monorepo with:
- frontend/ = React client
- server/ = Node/Express API with Prisma/Postgres

## Working agreements
- Do not change both frontend and backend in the same implementation step unless explicitly asked.
- Prefer small diffs over rewrites.
- For backend API changes, update the frontend contract notes.
- For frontend API integration, align with actual mounted backend routes.
- Before adding new abstractions, inspect existing project patterns.
- When implementing image CRUD, decide first whether images remain a single URL on Pet or become a dedicated PetImage model.

## Media handling
- Images are stored in Cloudinary, not in Postgres.
- Postgres stores image metadata and Cloudinary references.
- Do not store only a raw image URL when delete/replace flows require stable identifiers.
- Backend must enforce ownership before upload replacement or deletion.
- Prefer upload new -> persist DB -> delete old asset, to avoid broken image states.
- Frontend should use backend endpoints rather than talking directly to Cloudinary unless explicitly designed otherwise.

## Order of work
1. Explore current codepaths
2. Plan the smallest safe change
3. Implement backend first when API/data shape changes
4. Implement frontend after backend contract is clear
5. Review with a fresh reviewer agent