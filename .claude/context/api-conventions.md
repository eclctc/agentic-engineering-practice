# API Conventions

How to add a new API endpoint to Taskr.

## Rules

1. Put new routes in a dedicated file in `src/routes/`.
2. Name the file after the resource, lowercase and plural: `tasks.js`, `projects.js`, `comments.js`.
3. Export a named Express router from each route file.
4. Keep handlers thin. Each handler calls a corresponding function in `src/services/` and contains no business logic or database queries.
5. Report errors with a status code and message: services throw `HttpError` (`src/utils/http-error.js`), middleware calls `next({ status, message })`. Do not send error responses from the handler.
6. Register every router in `src/index.js` with `app.use`, using the resource path and the imported router.

## Route file

```js
// src/routes/tasks.js
const express = require('express');
const tasksService = require('../services/tasks');

const tasksRouter = express.Router();

tasksRouter.get('/:id', (req, res, next) => {
  const task = tasksService.getTaskById(parseInt(req.params.id));
  if (!task) return next({ status: 404, message: 'Task not found' });
  res.json(task);
});

module.exports = { tasksRouter };
```

## Registration

```js
// src/index.js
const { tasksRouter } = require('./routes/tasks');

app.use('/tasks', tasksRouter);
```

## Checklist

- Route file is `src/routes/<resource>.js`, lowercase plural.
- Router is exported by name, for example `{ tasksRouter }`.
- Every handler delegates to a function in `src/services/`.
- Errors go through `next({ status, message })`.
- Router is registered in `src/index.js` with `app.use('/<resource>', <resource>Router)`.
- Tests go in `tests/<resource>.test.js`.
