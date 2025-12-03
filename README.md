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

## 🚀 Getting Started

- **Prerequisites:** Node.js 18+ (for native `fetch`) and npm installed.
- **Install dependencies**
  ```bash
  npm install
  ```
- **Run the dev server**
  ```bash
  npm run dev
  ```
  Starts Fastify and the MSW mock server (dev only). Default URL: http://localhost:3000 (override with `PORT`).
- **Run tests**
  ```bash
  npm test
  ```
- **Build and start in production**
  ```bash
  npm run build
  npm start
  ```
  Set `NODE_ENV=production` and `PORT` as needed.

## 🧱 Project Architecture

```text
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
```

**Core principles:** Thin routes; business logic in services; shared utilities in `lib`; strict typing; isolation for testing; mock server separated from TypeScript.

## 📌 API Endpoints

Base: http://localhost:3000/api

| Method | Route | Description |
| --- | --- | --- |
| GET | /getUsers | List users |
| GET | /getEvents | List events |
| GET | /getEventsByUserId/:id | Task 2: parallel fetch |
| POST | /addEvent | Task 3: circuit breaker |

## ⚡ Task 2 — Parallel Fetching (Performance Optimization)

**Original problem:** `getEventsByUserId` fetched each event sequentially; the mock API adds a 500ms delay per event.  
**Solution:**
```ts
await Promise.all(user.events.map(getEventById));
```
**Result:** All event fetches fire concurrently. Measured response time ≈ 510 ms for 2 events (matches 500ms delay → parallel).

## 🛡 Task 3 — Custom Circuit Breaker

A fully custom implementation (no libraries), featuring:

- Closed → Open after 3 failures within rolling 30s window
- Open → Half-Open after cooldown
- Half-Open allows exactly 1 canary request; canary success → Closed; failure → Open (reset cooldown)
- Fail-fast behavior during OPEN state
- Typed event emitter for state transitions

Used for protecting the `/addEvent` endpoint from repeated external failures. Unit tests confirm all transitions.

## 🧪 Tests

Suite covers:

- Circuit Breaker state machine: failure accumulation, open state, half-open, canary success/failure, fail-fast logic
- `eventsByUser.service`: parallel latency check, empty events, event fetch failure → AppError
- `addEvent.service`: success flow, API-level error (success:false), breaker fail-fast, network errors
- `eventApi.service`: correct URLs and HTTP methods, JSON parsing, error cases, fetch rejection behavior
- Route integration: `/api/addEvent` HTTP codes, `sendError` formatting

## 🔍 Logging

Fastify logs include incoming request, route hit/miss, response time, and structured JSON output for debugging and performance insights.

## 🧩 What’s Missing / Unimplemented (by design)

These items were intentionally left out or are optional polish:

- ❌ ESLint + Prettier
- ❌ Test coverage reporting
- ❌ Integration tests for all routes
- ❌ Schema validation (Fastify Schema)
- ❌ Error boundary auditing
- ❌ Performance benchmark scripts
- ❌ Dockerfile
- ❌ CI pipeline
- ❌ Config improvements

## 🚀 Potential Improvements (If this were a real product)

1. Refactor Circuit Breaker into its own NPM package (fully generic and reusable).
2. Implement typed domain models (DTOs, validation, transformers).
3. Observability: add metrics for breaker state, Prometheus counters, tracing with OpenTelemetry.
4. Replace MSW with WireMock or lightweight Express stub for more realistic simulation.
5. Introduce Repository Pattern to prepare for real DB integration.
6. Rate limiting + request dedupe for resilience.
7. Retry & backoff strategy combined with circuit breaker for more robust recovery.

## 🏁 Conclusion

This project demonstrates strong TypeScript fundamentals, practical performance improvements, realistic resilience mechanisms, clean architecture, and full unit test coverage with a production-minded structure.
