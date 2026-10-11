const express = require('express');
const commentsService = require('../services/comments');
const { requireTask } = require('../middleware/require-task');
const { requireNonEmptyString, requireField } = require('../middleware/validate');

const commentsRouter = express.Router({ mergeParams: true });

commentsRouter.get('/', requireTask, (req, res) => {
  res.json(commentsService.listCommentsForTask(parseInt(req.params.id)));
});

commentsRouter.post(
  '/',
  requireTask,
  requireNonEmptyString('body'),
  requireField('user_id'),
  (req, res) => {
    const comment = commentsService.createComment(
      parseInt(req.params.id),
      parseInt(req.body.user_id),
      req.body.body
    );
    res.status(201).json(comment);
  }
);

module.exports = { commentsRouter };
