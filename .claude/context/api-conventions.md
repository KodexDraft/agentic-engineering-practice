# API Conventions: adding a new endpoint

Follow these rules when adding a new endpoint to the Taskr API. All source code lives in `src/`, layered as `routes -> services -> db/queries`.

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
- SQL lives only in `src/db/queries/<resource>.js`; services call queries, never `db` directly.
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

- Register every router in `src/routes/index.js` with `router.use`, using the resource path and the imported router:

```js
const { tagsRouter } = require('./tags');

router.use('/tags', tagsRouter);
```

- `src/index.js` mounts that combined router before the error-handling middleware.
- Nested resources (e.g. `/tasks/:id/comments`) use `express.Router({ mergeParams: true })` and are registered before `/tasks`.

## Checklist for a new endpoint

1. Add SQL to `src/db/queries/<resource>.js` and business logic to `src/services/<resource>.js`.
2. Create or extend `src/routes/<resource>.js` (lowercase plural) with a thin handler that calls the service and forwards errors to `next`.
3. Export the router by name and register it in `src/routes/index.js` with `router.use('/<resource>', <resource>Router)`.
4. Add tests in `tests/<resource>.test.js`.
