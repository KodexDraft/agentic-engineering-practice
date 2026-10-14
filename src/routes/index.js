const express = require('express');
const { healthRouter } = require('./health');
const { usersRouter } = require('./users');
const { projectsRouter } = require('./projects');
const { tasksRouter } = require('./tasks');
const { commentsRouter } = require('./comments');
const { tagsRouter, taskTagsRouter } = require('./tags');
const { webhooksRouter } = require('./webhooks');

const router = express.Router();

router.use('/health', healthRouter);
router.use('/users', usersRouter);
router.use('/projects', projectsRouter);
router.use('/tasks/:id/comments', commentsRouter);
router.use('/tasks/:id/tags', taskTagsRouter);
router.use('/tasks', tasksRouter);
router.use('/tags', tagsRouter);
router.use('/webhooks', webhooksRouter);

module.exports = { router };
