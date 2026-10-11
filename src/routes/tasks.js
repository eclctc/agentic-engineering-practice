const express = require('express');
const tasksService = require('../services/tasks');
const { requireNonEmptyString, validateTaskStatus } = require('../middleware/validate');
const { requireTask } = require('../middleware/require-task');

const tasksRouter = express.Router();

tasksRouter.get('/', validateTaskStatus('query'), (req, res) => {
  res.json(tasksService.listTasks(req.query));
});

tasksRouter.post('/', requireNonEmptyString('title'), (req, res) => {
  res.status(201).json(tasksService.createTask(req.body));
});

tasksRouter.get('/:id', (req, res) => {
  res.json(tasksService.getTaskById(parseInt(req.params.id)));
});

tasksRouter.put('/:id', requireTask, validateTaskStatus('body'), (req, res) => {
  res.json(tasksService.updateTask(parseInt(req.params.id), req.body));
});

tasksRouter.delete('/:id', (req, res) => {
  res.json(tasksService.deleteTask(parseInt(req.params.id)));
});

module.exports = { tasksRouter };
