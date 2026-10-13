# Testing Standards

Follow these rules when writing tests for the Taskr API.

## 1. File naming

- Test files are named `<resource>.test.js`, all lowercase: `tasks.test.js`, `projects.test.js`, `tags.test.js`.
- They live in `tests/`.
- Do not copy the inconsistent names of older files (`userTest.js`, `test-projects.js`).

## 2. Tools and database

- Use **Jest** as the test runner and **supertest** to make requests against the exported Express `app`.
- Tests run against an **in-memory SQLite database**, so no external setup is needed. Set `process.env.NODE_ENV = 'test'` as the very first line of the file, before requiring the app, so the app opens `:memory:`.
- Create the schema in `beforeAll` and clear the tables in `beforeEach`, so each test starts from a known state:

```js
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../index');
const { db } = require('../DB');
const { createSchema } = require('./schema');

beforeAll(() => {
  createSchema(db);
});

beforeEach(() => {
  db.exec('DELETE FROM task_tags; DELETE FROM comments; DELETE FROM tasks; DELETE FROM projects; DELETE FROM users; DELETE FROM tags;');
});
```

- Never depend on `taskr.db`, a running server, network access, or any service outside the test process.

## 3. Coverage per endpoint

Every endpoint needs at least:

- **One happy-path test**: valid input returns the expected status and body.
- **Two error-case tests**: for example, a missing or invalid field (400), an unknown id (404), a duplicate (409), or a missing API key on a protected route (401).

## 4. Test descriptions

- Describe what the endpoint does, in plain English, not how it is implemented.
- Good: `returns 404 when the task does not exist`, `creates a task assigned to a project`.
- Bad: `calls getTaskById and returns null`, `runs the INSERT query`.
- Group tests with `describe` by endpoint, for example `describe('GET /tasks/:id', ...)`.

## 5. Running

- The whole suite must run with `npm test` and nothing else: no extra setup, no environment variables, no manual seeding.
- A new test file named `<resource>.test.js` is picked up by the existing Jest `testMatch` pattern (`tests/*.test.js`), so no config change is needed.
- Before finishing, run `npm test` and confirm the new tests pass together with the existing ones.
