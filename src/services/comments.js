const commentsQueries = require('../db/queries/comments');
const usersQueries = require('../db/queries/users');
const { HttpError } = require('../utils/http-error');

function listCommentsForTask(taskId) {
  return commentsQueries.listCommentsForTask(taskId);
}

function createComment(taskId, userId, body) {
  if (!usersQueries.findUserById(userId)) throw new HttpError(400, 'user not found');
  return commentsQueries.insertComment(taskId, userId, body);
}

module.exports = { listCommentsForTask, createComment };
