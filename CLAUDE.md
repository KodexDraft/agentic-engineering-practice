# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
npm run db:seed          # create schema + sample data in taskr.db
npm run db:reset         # rm taskr.db and re-seed
npm run dev              # node --watch src/index.js (port 3000, /health to check)
npm start                # node src/index.js
npm test                 # jest
npm run test:watch
npx jest tests/tasks.test.js                 # single test file
npx jest tests/tasks.test.js -t "filters by" # single test by name
```

## Architecture

Express 5 + `better-sqlite3` (synchronous API). All code lives in `src/`, all file names are kebab-case, and requests flow `routes -> services -> db/queries`.

```
src/
  index.js            app builder; exports app, calls listen only when run directly
  routes/             one router per resource, mounted in routes/index.js; thin handlers
  services/           validation, business rules, error mapping (throw { status, message })
  db/
    connection.js     :memory: when NODE_ENV=test, otherwise $DB_PATH or taskr.db; WAL + foreign_keys
    schema.js         createSchema(db), the single source of truth for the schema
    seed.js           sample data (npm run db:seed)
    queries/          prepared SQL only, one file per resource
  middleware/         authenticate (x-api-key vs $API_KEY, default dev-key), request-logger, error-handler
  utils/              validation.js, constants.js (VALID_TASK_STATUSES, port, page sizes)
```

- `/` is defined inline in `src/index.js`; `/health` and `/webhooks/task-update` have their own route files.
- Comments and task-tag routes are nested routers (`mergeParams: true`) mounted at `/tasks/:id/comments` and `/tasks/:id/tags`, registered before `/tasks` in `routes/index.js`.
- `services/notifications.js` (`sendWelcomeEmail`) is a stub that only logs.
- Only `DELETE /users/:id` and `DELETE /projects/:id` require the API key.

## Rules

- Routes call services and forward errors with `next(err)`. No SQL, validation or `res.status(4xx)` in handlers.
- Services throw `{ status, message }` objects; `UNIQUE` constraint errors are mapped to 409 there.
- Only `src/db/queries/*` touches `db`. Do not import `db` from services or routes.
- Add new endpoints following `.claude/context/api-conventions.md`.
- Put new helpers in the most specific module. Do not create catch-all files (`utils.js`, `helpers.js`, `misc/`).

## Naming conventions

- All file and directory names are kebab-case (`error-handler.js`, `request-logger.js`); no camelCase or PascalCase file names.
- Route, service and query files use the lowercase plural resource name and share it across layers: `src/routes/tags.js` -> `src/services/tags.js` -> `src/db/queries/tags.js`.
- Routers are exported by name (`{ tagsRouter }`); services and queries export plain function objects.
- Test files are `tests/<resource>.test.js`.

## Never do these things

- Never add SQL or `db` access to `src/routes/` or `src/services/`; it belongs in `src/db/queries/`.
- Never put business logic, validation or `res.status(4xx)` in a route handler; call a service and forward errors with `next(err)`.
- Never import across layers upwards (queries must not import services; services must not import routes).
- Never recreate catch-all files such as `utils.js`, `helpers.js` or a `misc/` directory; put code in the most specific module.
- Never duplicate the schema; change it only in `src/db/schema.js`.
- Never create a test file that does not match `tests/*.test.js`; it will not run.
- Never commit `taskr.db*`, `node_modules/`, `.env` or `.DS_Store` (covered by `.gitignore`).

## Database schema

The schema lives only in `src/db/schema.js` (`createSchema(db)`). `src/db/seed.js` and the tests both call it, so a table or column change is made in one place.

## Tests

Jest config is in `package.json`; `testMatch` is `tests/*.test.js`, so a test file with any other name will not run.

Each test file sets `process.env.NODE_ENV = 'test'` as its first line, before requiring `../src/index`, so that `src/db/connection.js` uses the in-memory database. It then calls `createSchema(db)` in `beforeAll` and clears every table in `beforeEach`. Follow this pattern for new tests. Requests go through `supertest` against the exported `app`.

## Conventions seen in the code

- Errors are returned as `{ error: '<message>' }` with 400/404/409.
- When updating a task, `completed_at` is set only when status changes to `completed` and cleared when it changes to anything else.
- `GET /tasks` paginates with `page` and `page_size`; the page size is capped at 100 and defaults to 20.

## Context files

Read these files before starting a matching task. They are not loaded automatically.

- `.claude/context/api-conventions.md`: for any task involving API routes or endpoints.
- `.claude/context/testing-standards.md`: for any task involving tests or test coverage.
