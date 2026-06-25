# GitHub Copilot instructions

Guidance for the GitHub Copilot coding agent, Copilot code review, and Copilot Chat in
this repository.

**[`CLAUDE.md`](../CLAUDE.md) is the single source of truth** for how this project is
built — its domain rules, stack, repository layout, commands, conventions, Docker/deploy
notes, and hard constraints apply in full. Read it first. This file adds only the
GitHub-workflow rules specific to how the agent participates in the dev loop (project #387).

## What this project is

The application (a Cal.com-style call booking service) is **already built**. Project #387
does **not add product features for their own sake** — it exercises the
**organizational/agent workflow** on GitHub: `issue → triage → PR → review → fixes →
scheduled checks`. See [`docs/PROJECT-387-CONTEXT.md`](../docs/PROJECT-387-CONTEXT.md).

## How you participate

- **Issue work:** when assigned an issue, scope the change, implement it on a branch, and
  open a focused pull request (one issue per PR). Keep PRs small and reviewable.
- **Code review:** when asked to review a PR, focus on contract/behavior correctness, the
  no-double-booking rule, type safety, and whether both sides stayed in sync with the
  contract.
- **After review:** push fix-up commits to the same branch addressing every comment.

## Non-negotiable workflow rules

- **Design First.** The API boundary is [`packages/contract/`](../packages/contract/)
  (TypeSpec → OpenAPI 3). On any behavior change, edit the contract first
  (`npm run contract:build`), then sync backend and frontend independently. Never edit the
  generated `src/api/schema.d.ts` by hand.
- **Conventional Commits are mandatory.** PR titles and commits must be
  `type(scope): summary` (`feat`, `fix`, `docs`, `test`, `ci`, `build`, `refactor`, `perf`,
  `chore`). PRs are **squash-merged**, so the **PR title becomes the commit on `main`** and
  feeds release-please. See [`CONTRIBUTING.md`](../CONTRIBUTING.md).
- **TypeScript strict everywhere.** No untyped escapes; explicit types at module boundaries.

## Before opening or updating a PR, run

```bash
npm run lint
npm run format:check
npm test -w @calls/backend
npm run test:e2e -w @calls/backend
npm run e2e            # Playwright booking scenario (real browser)
```

## Hard constraints — do not violate

- **Never** edit, rename, or delete `.github/workflows/hexlet-check.yml`.
- **Do not rename the repository.** Keep the Hexlet badge in `README.md` intact.
- The final app must remain Dockerizable (build → image → container on `process.env.PORT`).
