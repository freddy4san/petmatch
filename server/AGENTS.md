# AGENTS.md

## Project Overview

PetMatch backend — a Tinder-like application for pets.

Users can:

* Register and authenticate
* Create and manage pet profiles
* Like or dislike other pets
* Match when two pets like each other
* (Future) messaging between matched users

This backend exposes a REST API that will be consumed by a React frontend.

---

## Tech Stack

* Node.js (Express)
* PostgreSQL
* Prisma ORM
* Zod (validation)
* JWT (authentication)

---

## Architecture Principles

### General Rules

* Backend-only scope — DO NOT modify frontend code
* Use RESTful API design
* Keep controllers thin (no business logic)
* Business logic must live in services
* All database access must go through Prisma
* Write clean, modular, readable code

---

## Project Structure

* src/routes → define API routes
* src/controllers → handle HTTP request/response
* src/services → business logic
* src/middleware → authentication & validation
* src/lib → utilities (JWT, Prisma client, helpers)
* src/types → shared types (if needed)

---

## API Standards

### Response Format

Success:
{
"success": true,
"data": ...
}

Error:
{
"success": false,
"error": "Error message"
}

### HTTP Status Codes

* 200 → success
* 201 → resource created
* 400 → validation error
* 401 → unauthorized
* 403 → forbidden
* 404 → not found
* 500 → server error

---

## Authentication Rules

* Use JWT for authentication
* Protect private routes with auth middleware
* Extract user from token and attach to request
* Never expose sensitive data (passwords, tokens)
* Passwords must be hashed using bcrypt

---

## Validation Rules

* Use Zod for all request validation
* Validate:

  * request body
  * query params
  * route params
* Reject invalid input with 400 response

---

## Database Rules

* Use Prisma schema for all models
* Do not write raw SQL unless necessary
* Keep relationships explicit and normalized

### Core Models

* User

  * id
  * email
  * password
  * createdAt

* Pet

  * id
  * name
  * age
  * breed
  * imageUrl
  * ownerId (User)

* Like

  * id
  * fromPetId
  * toPetId

* Match

  * id
  * pet1Id
  * pet2Id
  * createdAt

---

## Feature Requirements

### Auth

* Register user
* Login user
* Return JWT token

### Pets

* Create pet profile
* Update pet profile
* Get pet by ID
* List pets (for discovery)

### Matching System

* Like a pet
* Dislike a pet (optional)
* If two pets like each other → create match
* Prevent duplicate likes
* Prevent liking own pet

---

## Business Logic Rules

* A pet cannot like itself
* A user can only manage their own pets
* Matching occurs only on mutual likes
* Ensure idempotency where possible

---

## Code Style

* Use async/await (no callbacks)
* Use clear and descriptive naming
* Avoid deeply nested logic
* No console.log in production code
* Keep functions small and focused

---

## Error Handling

* Use centralized error handling where possible
* Return consistent error responses
* Do not leak internal errors to clients

---

## Testing (Minimum Requirement)

* Add basic tests for core endpoints
* Ensure critical flows work:

  * auth
  * pet creation
  * matching

---

## Definition of Done

A feature is complete when:

* It works as expected
* Inputs are validated
* Auth is enforced where required
* Code follows architecture rules
* API response format is correct
* No breaking changes introduced

---

## Commands

* Run dev server: npm run dev
* Run tests: npm test
* Prisma generate: npx prisma generate
* Prisma migrate: npx prisma migrate dev

---

## Notes for AI Agents

* Follow this file strictly
* Do not change architecture unless explicitly asked
* Prefer modifying existing patterns over creating new ones
* Keep solutions simple and maintainable
