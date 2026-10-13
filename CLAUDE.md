# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
npm run db:seed          # create schema + sample data in taskr.db
npm run db:reset         # rm taskr.db and re-seed
npm run dev              # node --watch index.js (port 3000, /health to check)
npm start                # node index.js
npm test                 # jest
npm run test:watch
npx jest tests/tasks.test.js                 # single test file
npx jest tests/tasks.test.js -t "filters by" # single test by name
```

## Known structural problems (intentional)

This codebase has intentional structural problems that will be addressed in a future refactor. Understand the current state, but do not reinforce the bad patterns:

- Do not add new code in the style of the problem areas below just because that is what the surrounding code does. Follow the intended direction instead (see the `TODO` comments in `routes.js`, `middleware.js`, and `auth.js`): separate files per resource, a repository layer for queries, shared validation middleware.
- Do not copy the inline-SQL-in-handlers or inline-validation patterns from `routes.js` into new endpoints.
- Do not add more code to the catch-all places (`routes.js`, `DB.js`, `misc/constants.js`, `utils.js`, `index.js`). Put new logic in a new, well-named module.
- Do not build on the dead code in `misc/oldRoutes.js` and `misc/temp.js`.
- Do not start the refactor unprompted. Fix only what the current task needs; mention nearby structural problems instead of silently reorganizing them.
- When touching an area, keep the change small and consistent with the current behavior. Existing tests must keep passing.

## Never do these things

- Never add new route logic to `routes.js`. It is already too large; any new routes must be placed in a dedicated route file.
- Never add new utility functions to `utils.js` without first checking whether they belong in a more specific module.
- Never import from any file in the `misc` directory. That code is dead and scheduled for removal.

## Architecture

Express 5 + `better-sqlite3` (synchronous API). All source files sit flat in the repo root; there is no `src/`. Many files carry `TODO` comments describing the intended cleanup.

- `index.js` builds the Express app and exports it (it only calls `listen` when run directly, so tests can import it). It also defines `/` and `/webhooks/task-update` inline, outside `routes.js`.
- `routes.js` holds every resource route (users, projects, tasks, comments, tags). Handlers run SQL against `db` directly and validate inline. There is no service or repository layer.
  - Exception: `/users*` delegates to `UserController.js`. The welcome email is sent from there via `sendEmail.js`, a stub that only logs.
  - `/tasks` list and `/tasks/:id` use `get-tasks.js`.
  - `/projects/:id` lazily requires `projectHelpers.js` for stats. `projectHelpers.js` and `routes.js` form a circular dependency, which is why that require is lazy; keep it lazy.
- `DB.js` opens the connection: `:memory:` when `NODE_ENV=test`, otherwise `$DB_PATH` or `taskr.db`. It enables WAL and `foreign_keys`.
- `auth.js` is a placeholder: it compares the `x-api-key` header to `$API_KEY` (default `dev-key`). Only `DELETE /users/:id` and `DELETE /projects/:id` use it.
- `misc/constants.js` holds `VALID_TASK_STATUSES` (`active`, `completed`, `archived`), the port, and the pagination helpers. It also contains helpers that belong in `utils.js`.
- `misc/oldRoutes.js` and `misc/temp.js` are dead code, not imported anywhere.

## Database schema lives in two places

The schema is duplicated: `db/seed.js` creates it for real use, and `tests/schema.js` (`createSchema(db)`) creates it for tests. When you change a table or column, update both.

## Tests

Jest config is in `package.json` and `testMatch` lists three patterns explicitly: `tests/*.test.js`, `tests/userTest.js`, `tests/test-projects.js`. A new test file with any other name will not run unless you add it there or follow the `*.test.js` pattern.

Each test file sets `process.env.NODE_ENV = 'test'` as its first line, before requiring `../index`, so that `DB.js` uses the in-memory database. It then calls `createSchema(db)` in `beforeAll` and clears every table in `beforeEach`. Follow this pattern for new tests. Requests go through `supertest` against the exported `app`.

## Test file naming

All new test files must follow the naming pattern:

`<resource>.test.js`

The existing inconsistent naming in the `tests` directory is a known issue. Do not replicate it; new tests must use the standard naming convention above.

## Conventions seen in the code

- Route handlers return `{ error: '<message>' }` with 400/404/409. `UNIQUE` constraint errors are mapped to 409 by matching on `err.message`.
- When updating a task, `completed_at` is set only when status changes to `completed` and cleared when it changes to anything else.
- `GET /tasks` paginates with `page` and `page_size`; the page size is capped at 100 and defaults to 20.

## Context files

Read these files before starting a matching task. They are not loaded automatically.

- `.claude/context/api-conventions.md`: for any task involving API routes or endpoints.
- `.claude/context/testing-standards.md`: for any task involving tests or test coverage.
