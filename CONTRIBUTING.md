# Contributing

## Commit messages — Conventional Commits

This repo uses [Conventional Commits](https://www.conventionalcommits.org/) so that
[release-please](https://github.com/googleapis/release-please) can derive the next
version and generate the changelog automatically. Every commit that reaches `main`
**must** follow:

```
type(optional-scope): summary
```

- **Types:** `feat`, `fix`, `docs`, `test`, `ci`, `build`, `refactor`, `perf`, `chore`.
- **Scope** (optional) names the area: `feat(backend): …`, `fix(frontend): …`,
  `ci(e2e): …`, `docs(contract): …`.
- **Version bumps:** `feat` → minor, `fix`/`perf` → patch. `docs`/`chore`/`ci`/`build`/
  `refactor` do **not** bump the version on their own.
- **Breaking changes:** `feat!:` / `fix!:` or a `BREAKING CHANGE:` footer → major bump.

### Squash merges set the commit message

We squash-merge pull requests, so **the PR title becomes the commit on `main`**. That
title must therefore be a valid Conventional Commit (e.g. `feat: add availability editor`).
A non-conventional title (like `add base app`) leaves release-please with nothing to
release.

## Local checks before opening a PR

```bash
npm run lint            # ESLint across the repo
npm run format:check    # Prettier
npm run test -w @calls/backend       # backend unit tests
npm run test:e2e -w @calls/backend   # backend e2e tests
npm run e2e             # Playwright booking scenario (real browser)
```

## Releases

`.github/workflows/release-please.yml` runs on every push to `main` and maintains a
release PR (changelog + version bump). Merging that PR tags and cuts the release.
