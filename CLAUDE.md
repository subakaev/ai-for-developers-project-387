# CLAUDE.md

Guidance for AI agents working in this repository. This is the **single source of
truth** for how the project is built. Read it before making changes.

## Project

**Calendar of calls** — a simplified, Cal.com-style call booking service
(Hexlet project #386). An owner publishes event types; guests pick a free 30-minute
slot and book a call. There is **no authentication**.

This project is built **agentically**: ideally no code is written by hand. You
describe the task, the agent implements it, the human reviews and iterates.

## Domain rules (authoritative)

- There is **one fixed owner** profile. No registration, no login, no personal
  accounts. Guests book anonymously.
- **EventType** — created by the owner, who **assigns its `id`** (a unique slug).
  Fields: `id`, `title`, `description`, `durationMinutes`. Duplicate id → 409.
- **Availability** — a single owner-level **weekly schedule** (working hours per
  weekday + IANA timezone). The owner configures it; there is no per-event-type
  schedule.
- **Slot** — bookable time. Slots are sized by the event type's `durationMinutes`,
  aligned to a **30-minute grid**, and generated from the availability schedule
  intersected with a rolling **14-day window** from today (emitted as UTC instants).
- **Booking** — a guest reserves a free slot. Its `end` = `start + durationMinutes`.
  - **A given time cannot be booked twice — even across different event types**
    (overlap is checked on `[start, end)` of every booking).
  - A guest may only book a free, on-grid slot inside the 14-day window.
- The owner sees a **single list** of all upcoming bookings across every event type.

The full contract lives in `packages/contract/main.tsp`. See `docs/step1.md` and
`docs/step2.md` for the original assignment.

## Stack

- **Language:** TypeScript everywhere (mandatory, `strict` mode).
- **Contract:** [TypeSpec](https://typespec.io/) → OpenAPI 3.
- **Backend:** Nest.js (`apps/backend`).
- **Frontend:** React (`apps/frontend`).
- **Tooling:** npm workspaces, ESLint 9 (flat config), Prettier, Node ≥ 22.
- **Delivery:** the app must build into a **Docker image** and run in a container.

## Repository layout

```
packages/
  contract/      TypeSpec API contract → generates OpenAPI 3 (source of truth)
apps/
  backend/       Nest.js API implementing the contract (in-memory store)
  frontend/      React + Vite + Mantine app (consumes the contract)
docs/            Assignment steps
```

Shared TypeScript settings live in `tsconfig.base.json`; each workspace extends it.

### Backend (`apps/backend`, `@calls/backend`)

- **Stack:** Nest.js; validation via class-validator; timezone/slot math via Luxon.
- **Storage:** in-memory (`src/store/store.service.ts`), seeded on boot with default
  availability (Mon–Fri 09:00–17:00) + sample event types. **Resets on restart** — no DB.
- **Contract-bound:** response types come from `src/api/schema.d.ts`
  (`npm run gen:api -w @calls/backend`). Errors render as the contract's `ApiError`
  (`{ code, message }`) via `src/common/api-exception.filter.ts`.
- **Business rules:** slot generation + the no-double-booking rule live in
  `src/domain/slots.ts` (pure, unit-tested). Booking conflicts return **409**.
- **Runs on** `http://localhost:3000` (controllers mount at the contract paths, no prefix).

### Frontend (`apps/frontend`, `@calls/frontend`)

- **Stack:** Vite + React + Mantine; routing via React Router; data via TanStack Query.
- **Contract-bound API:** `src/api/schema.d.ts` is generated from the OpenAPI by
  `npm run gen:api -w @calls/frontend` (do not edit by hand). `src/api/client.ts`
  wraps it with `openapi-fetch`; `src/api/queries.ts` exposes one hook per operation.
- **Dev data:** the Vite dev server proxies `/api` → the backend (`:3000`) by default.
  `npm run dev:mock` instead proxies to a **Prism** mock (`:4010`) for contract-only work.

## Design First workflow

The API contract is the boundary between frontend and backend and the single source
of truth. The loop is:

1. Edit the TypeSpec contract in `packages/contract/`.
2. Regenerate OpenAPI: `npm run contract:build`.
3. Implement backend and frontend **independently** against the generated contract —
   neither side needs to read the other's internals.
4. On any behavior change, update the contract first, then sync both sides.

## Commands

```bash
npm install                      # install all workspaces
npm run contract:build           # compile TypeSpec → OpenAPI 3 (packages/contract/tsp-output)
npm run dev                      # backend (:3000) + Vite (:5173) together
npm run dev:mock                 # Prism mock (:4010) + Vite, for contract-only work
npm run mock                     # serve the contract as a mock API (Prism, :4010)
npm run gen:api -w @calls/backend    # regenerate backend API types from the contract
npm run gen:api -w @calls/frontend   # regenerate frontend API types from the contract
npm run build -w @calls/backend  # nest build (typecheck + emit)
npm run test -w @calls/backend       # backend unit tests
npm run test:e2e -w @calls/backend   # backend e2e tests
npm run lint                     # ESLint across the repo
npm run format:check             # Prettier check
npm run e2e                      # Playwright e2e (boots backend + Vite, drives a real browser)
```

## Conventions

- TypeScript `strict`; no untyped escapes. Prefer explicit types at module boundaries.
- One monorepo, npm workspaces. Put shared, cross-cutting types behind the contract.
- Keep changes minimal and reviewable — this is an agent-driven, review-first project.

## Commits

All commits — including agent-written ones — follow
[Conventional Commits](https://www.conventionalcommits.org/):
`type(optional-scope): summary`. This is **mandatory**: release-please derives the
next version and the changelog from this history.

- Common types: `feat`, `fix`, `docs`, `test`, `ci`, `build`, `refactor`, `perf`, `chore`.
- Optional scope names the area, e.g. `feat(backend): …`, `fix(frontend): …`,
  `ci(e2e): …`, `docs(contract): …`.
- Breaking changes use `feat!:`/`fix!:` or a `BREAKING CHANGE:` footer → major bump.
- `feat` → minor bump, `fix`/`perf` → patch bump; `chore`/`ci`/`build` don't bump.

## Testing & releases

- **Integration tests:** Playwright (`e2e/`, root `playwright.config.ts`) covers the main
  booking scenario in a real browser against the live frontend + backend. `npm run e2e`
  starts `npm run dev` automatically; the `.github/workflows/e2e.yml` workflow runs it in CI.
- **Releases:** `.github/workflows/release-please.yml` runs release-please on every push to
  `main`. It maintains a release PR (changelog + version bump in `package.json` /
  `CHANGELOG.md`) from the Conventional Commit history; config in `release-please-config.json`
  - `.release-please-manifest.json`. Merging that PR cuts the release.

## Docker & deploy

- **Single image, single port.** The root `Dockerfile` (multi-stage) builds the SPA and the
  Nest server, then runs `node apps/backend/dist/main.js`. The container listens on
  **`process.env.PORT`** (bound to `0.0.0.0`); `PORT` is injected by the host (Render / the
  Hexlet grader). Build/run locally: `docker build -t calls-app . && docker run -e PORT=10000 -p 10000:10000 calls-app`.
- **Backend serves the SPA + API on one origin.** In production the React build is served by
  Nest via `@nestjs/serve-static` (registered in `src/app.module.ts` **only when the build dir
  exists**, so local dev and the Jest e2e suite are unaffected). API stays at the contract's
  root paths; `exclude` keeps unknown API paths returning JSON, and unknown GETs fall back to
  `index.html` for SPA routing.
- **Frontend API base.** The SPA is built with `VITE_API_BASE_URL=""` so it calls the API
  same-origin (no `/api` prefix, no proxy). Dev still uses the `/api` Vite proxy (env unset).
- **Deploy:** Render web service (Docker) from the public repo, branch `main`; the live URL is
  in `README.md`. The in-memory store resets on each redeploy/spin-up.

## Hard constraints — do not violate

- **Never** edit, rename, or delete `.github/workflows/hexlet-check.yml`. It runs the
  Hexlet graders.
- **Do not rename the repository.**
- Keep the Hexlet badge in `README.md` intact.
- The final app must remain Dockerizable (build → image → container).
