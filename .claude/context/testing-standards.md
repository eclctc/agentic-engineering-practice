# Testing Standards

How to write tests for the Taskr API.

## Rules

1. Name test files `<resource>.test.js`, lowercase: `tasks.test.js`, `users.test.js`.
2. Use Jest and supertest against the in-memory SQLite database. No external setup is required.
3. Cover the happy path and at least two error cases for each endpoint.
4. Write test descriptions in plain English that say what the endpoint does, not how it is implemented.
5. The suite must run with `npm test` and nothing else.

## Test file setup

Set `NODE_ENV` to `test` before requiring the app so `src/db/connection.js` opens `:memory:`. Create the schema once, and clear tables before each test.

```js
process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('../src/index');
const { db } = require('../src/db/connection');
const { createSchema } = require('../src/db/schema');

beforeAll(() => {
  createSchema(db);
});

beforeEach(() => {
  db.exec('DELETE FROM task_tags; DELETE FROM comments; DELETE FROM tasks; DELETE FROM projects; DELETE FROM users; DELETE FROM tags;');
});
```

## Coverage per endpoint

Each endpoint needs:

- One happy path test with the expected status and response body.
- At least two error cases, such as missing required fields (400), unknown id (404), duplicate value (409), or missing credentials (401).

## Test descriptions

Describe the behavior from the caller's point of view.

```js
// Good
test('creates a task and returns it', ...);
test('returns 404 when the task does not exist', ...);
test('rejects a task with no title', ...);

// Bad
test('calls db.prepare with INSERT', ...);
test('handler returns early', ...);
```

## Checklist

- File is `tests/<resource>.test.js`, lowercase.
- Uses supertest against the exported app and the in-memory database.
- Every endpoint has a happy path and at least two error cases.
- Descriptions are plain English and behavior-focused.
- `npm test` passes with no other setup.
