const express = require('express');
const tagsService = require('../services/tags');
const { requireTask } = require('../middleware/require-task');
const { requireField } = require('../middleware/validate');

const taskTagsRouter = express.Router({ mergeParams: true });

taskTagsRouter.post('/', requireTask, requireField('tag_id'), (req, res) => {
  const result = tagsService.attachTagToTask(parseInt(req.params.id), parseInt(req.body.tag_id));
  res.status(201).json(result);
});

taskTagsRouter.delete('/:tagId', (req, res) => {
  const result = tagsService.detachTagFromTask(parseInt(req.params.id), parseInt(req.params.tagId));
  res.json(result);
});

module.exports = { taskTagsRouter };
