# API Conventions: adding a new endpoint

Follow these rules when adding a new endpoint to the Taskr API. They describe the target structure **after the refactor**: new code goes in `src/`, not in the flat root files (`routes.js`, `index.js`, etc.). Do not add new route logic to `routes.js`.

## 1. Route files

- Every resource gets its own route file in `src/routes/`.
- The file name is the resource name in **lowercase plural**: `src/routes/tasks.js`, `src/routes/projects.js`, `src/routes/tags.js`.
- Each route file exports a **named** Express router:

```js
// src/routes/tags.js
const express = require('express');
const tagsService = require('../services/tags');

const tagsRouter = express.Router();

// ...routes here

module.exports = { tagsRouter };
```

## 2. Handlers call services

- Route handlers contain no business logic: no SQL, no validation rules, no data shaping.
- Every handler calls a corresponding function in `src/services/` and sends back the result.
- The service file has the same resource name as the route file: `src/routes/tags.js` calls `src/services/tags.js`.

```js
tagsRouter.get('/', (req, res, next) => {
  try {
    res.json(tagsService.listTags());
  } catch (err) {
    next(err);
  }
});
```

## 3. Error handling

- Pass errors to Express's `next` function. Do not send error responses directly from handlers.
- The error carries a status code and a message, as an object with `status` and `message`:

```js
next({ status: 404, message: 'Tag not found' });
```

- Services throw errors of the same shape (`{ status, message }`); handlers catch them and forward them to `next`.
- The shared error-handling middleware turns the object into the response (`res.status(err.status || 500).json({ error: err.message })`).

## 4. Registering the router

- Register every router in `src/index.js` with `app.use`, using the resource path and the imported router:

```js
const { tagsRouter } = require('./routes/tags');

app.use('/tags', tagsRouter);
```

- Register routers before the error-handling middleware.

## Checklist for a new endpoint

1. Create or extend `src/services/<resource>.js` with the business logic.
2. Create or extend `src/routes/<resource>.js` (lowercase plural) with a thin handler that calls the service and forwards errors to `next`.
3. Export the router by name and register it in `src/index.js` with `app.use('/<resource>', <resource>Router)`.
4. Add tests in `tests/<resource>.test.js`.
