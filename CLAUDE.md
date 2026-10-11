# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm install
npm run db:seed          # create schema + sample data in taskr.db
npm run db:reset         # rm taskr.db and re-seed
npm run dev              # node --watch src/index.js, port 3000 (PORT env overrides)
npm test                 # jest, all tests
npx jest tests/tasks.test.js                 # single test file
npx jest tests/tasks.test.js -t "returns all tasks"   # single test by name
```

There is no linter or build step. Plain CommonJS, no transpilation.

## Folder structure

Express 5 + `better-sqlite3` (synchronous API, no ORM). All application code lives under `src/`.

```
src/
  index.js                app setup, router registration, exports app
  routes/                 HTTP layer, one router per resource
    health.js  webhooks.js  users.js  projects.js  tasks.js  tags.js
    comments.js           /tasks/:id/comments
    task-tags.js          /tasks/:id/tags
  services/               business logic, one module per resource
    users.js  projects.js  tasks.js  comments.js  tags.js
  db/
    connection.js         shared better-sqlite3 connection
    schema.js             createSchema(db), single schema definition
    seed.js               sample data
    queries/              all SQL, one module per resource
      users.js  projects.js  tasks.js  comments.js  tags.js
  middleware/             auth, validation, logging, error handling
    auth.js  validate.js  require-task.js  request-logger.js  error-handler.js
  utils/                  constants and small helpers
    constants.js  validators.js  http-error.js  send-email.js
tests/
  users.test.js  projects.test.js  tasks.test.js  comments.test.js  tags.test.js
```

### Layering

Routes call services, services call queries, queries call the database connection. Nothing skips a layer.

```
routes -> services -> db/queries -> db/connection
```

- **Routes** parse the request and send the response. No SQL, no business logic. Routers are named exports (`{ tasksRouter }`), and `comments.js` and `task-tags.js` are `mergeParams` routers.
- **Services** hold business rules: existence checks, the `completed_at` transition, pagination clamp, UNIQUE-to-409 mapping, the welcome email. Failures are thrown as `HttpError`.
- **Queries** are the only place SQL lives. Each function takes plain values and returns rows or counts.
- **Connection** opens the single shared database. `NODE_ENV=test` selects `:memory:`; otherwise `DB_PATH` or `taskr.db`. Foreign keys are on.
- **Middleware:** `auth.js` is a placeholder `x-api-key` check against `API_KEY` (default `dev-key`), applied only to `DELETE /users/:id` and `DELETE /projects/:id`.
- **Utils:** `constants.js` holds `PORT` and `VALID_TASK_STATUSES`; `send-email.js` is a stub.

## Naming conventions

- All files and directories use kebab-case: `task-tags.js`, `error-handler.js`, `request-logger.js`.
- Source files are named after the resource, lowercase and plural: `tasks.js`, `users.js`.
- Test files are `<resource>.test.js` and live in `tests/`.
- JSON fields, query params, and DB columns stay snake_case (`project_id`, `owner_id`). Kebab-case applies to file names only.
- Functions and variables are camelCase; classes are PascalCase (`HttpError`).

## Rules

- New routes go in a dedicated `src/routes/<resource>.js` and are registered in `src/index.js`. Handlers contain no SQL or business logic.
- All SQL goes in `src/db/queries/`. Never call `db.prepare` from services, routes, or middleware.
- Check whether a utility belongs in a more specific module before adding it to `src/utils/`.
- Errors: services throw `HttpError(status, message)`; middleware calls `next({ status, message })`. `error-handler.js` responds `{ error: message }`.

## Gotchas

- Tests set `process.env.NODE_ENV = 'test'` before requiring the app, call `createSchema(db)` themselves, and clear tables in `beforeEach`. Do this in any new test file. Each test file gets its own in-memory DB.
- Test files are named `<resource>.test.js`. `package.json` `jest.testMatch` is `**/tests/*.test.js`.
- `src/db/seed.js` runs at require time with no NODE_ENV guard. Do not require it from tests.
- Task status is constrained to `active | completed | archived` (DB CHECK constraint and `VALID_TASK_STATUSES`). `completed_at` is set in `tasksService.updateTask` when status transitions.
- `PUT /users/:id` with a duplicate email returns 500 with the raw SQLite message (existing behavior, not mapped to 409).
- `PUT /tasks/:id` relies on `requireTask` running first; `tasksService.updateTask` assumes the task exists.

## Context files

Read these before starting the relevant task:

- `.claude/context/api-conventions.md` - for any task involving API routes or endpoints.
- `.claude/context/testing-standards.md` - for any task involving tests or test coverage.
