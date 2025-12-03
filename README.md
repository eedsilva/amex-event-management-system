# Event Service — Fastify + TypeScript + Circuit Breaker + Parallel Fetch

A clean, modular, and production-minded backend implementing:

- ⚡ **Fastify** for high-performance HTTP
- 🧠 **TypeScript everywhere**
- 🎯 **Task 2:** Parallel I/O optimization for event fetching
- 🛡 **Task 3:** Custom circuit breaker with half-open canary logic
- 🧪 **Full unit test suite (Jest + ts-jest)**
- 🧰 **MSW Mock Server** simulating real external API delays and failures
- 📦 Clean architecture (routes → services → libs)

This project demonstrates high-quality TypeScript patterns, resilience engineering, and performance-driven design.

---

# 🚀 Getting Started

```bash
npm install
npm run dev
Server:

arduino
Copy code
http://localhost:3000
Run tests:

bash
Copy code
npm test
Build:

bash
Copy code
npm run build
npm start
🧱 Project Architecture
graphql
Copy code
src/
  server.ts                # App bootstrap + mock server startup
  config/                  # Environment + API URLs
  routes/                  # Fastify route definitions
  services/                # Business logic (Task 2 + Task 3)
  lib/                     # Circuit breaker, typed emitter, AppError
mock-server/
  index.js                 # MSW node mock API
  userStore.js
  eventStore.js
tests/
  *.test.ts                # Jest unit tests
Core principles:

Thin routes

Business logic in services

Shared utilities in /lib

Strict typing

Isolation for testing

Mock server separated from TypeScript

📌 API Endpoints
Base: http://localhost:3000/api

Method	Route	Description
GET	/getUsers	List users
GET	/getEvents	List events
GET	/getEventsByUserId/:id	Task 2: parallel fetch
POST	/addEvent	Task 3: circuit breaker

⚡ Task 2 — Parallel Fetching (Performance Optimization)
Original Problem
getEventsByUserId fetched each event sequentially.
The mock API adds a 500ms delay per event.

Example sequential time:

matlab
Copy code
3 events → 1.5s
5 events → 2.5s
10 events → 5s
Solution
Replace sequential logic with:

ts
Copy code
await Promise.all(user.events.map(getEventById));
Result
All event fetches fire concurrently.

Measured response time:

arduino
Copy code
≈ 510 ms for 2 events (matches 500ms delay → parallel)
This was validated in both manual logs and automated tests.

🛡 Task 3 — Custom Circuit Breaker
A fully custom implementation (no libraries), featuring:

Closed → Open after 3 failures within rolling 30s window

Open → Half-Open after cooldown

Half-Open allows exactly 1 canary request

Canary success → Closed

Canary failure → Open (reset cooldown)

Fail-fast behavior during OPEN state

Typed event emitter for state transitions

Used for protecting the /addEvent endpoint from repeated external failures.

Unit tests confirm all transitions.

🧪 Tests
Test suite includes:

✔ Circuit Breaker (full state machine)
failure accumulation

open state

half-open

canary success

canary failure

fail-fast logic

✔ eventsByUser.service (parallel fetch)
parallel latency check

empty events

event fetch failure → AppError

✔ addEvent.service (breaker wrapper)
success flow

API-level error (success:false)

breaker fail-fast behavior

network errors

✔ eventApi.service
correct URLs

correct HTTP methods

JSON parsing behavior

error cases

fetch rejection behavior

✔ Route Integration Tests
/api/addEvent returns correct HTTP codes

sendError formatting works as expected

🔍 Logging
Fastify logs include:

Incoming request

Route hit/miss

Response time

Structured JSON output

Useful for debugging and performance insights.

🧩 What’s Missing / Unimplemented (by design)
These items were intentionally left out or are optional polish:

❌ ESLint + Prettier
Would enforce consistent code style and static analysis

Easy to add with eslint-config-google or eslint-config-standard

❌ Test Coverage Reporting
Jest can produce coverage/lcov-report

Useful for completeness but not required for the challenge

❌ Integration Tests for All Routes
Only critical ones implemented

Others easy to add via app.inject()

❌ Schema Validation (Fastify Schema)
Input validation currently minimal

Could use zod or Fastify's schema system

❌ Error Boundary Auditing
Some external-network error cases could be normalized further

❌ Performance Benchmark Scripts
Could add autocannon tests for load testing

❌ Dockerfile
For portability and deployment-friendly packaging

❌ CI Pipeline
GitHub Actions: run tests on push

❌ Config Improvements
Environment variable validation

Split dev/testing/production configs

🚀 Potential Improvements (If this were a real product)
1. Refactor Circuit Breaker into its own NPM package
It’s fully generic and reusable.

2. Implement typed domain models
(DTOs, validation, transformers)

3. Observability
Add metrics for breaker state

Add Prometheus counters

Add tracing with OpenTelemetry

4. Replace MSW with WireMock or lightweight Express stub
More realistic in production simulation.

5. Introduce Repository Pattern
To prepare for real DB integration.

6. Rate limiting + request dedupe
For resilience.

7. Retry & Backoff strategy
Combine with circuit breaker for more robust recovery.

🏁 Conclusion
This project demonstrates:

Strong TypeScript fundamentals

Practical performance improvements

Realistic resilience mechanisms

Clean architecture

Full unit test coverage

Production-minded structure

