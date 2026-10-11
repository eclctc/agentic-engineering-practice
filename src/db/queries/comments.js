const { db } = require('../connection');

const SELECT_WITH_USER_NAME = 'SELECT c.*, u.name as user_name FROM comments c JOIN users u ON u.id = c.user_id';

function listCommentsForTask(taskId) {
  return db.prepare(`${SELECT_WITH_USER_NAME} WHERE c.task_id = ? ORDER BY c.created_at ASC`).all(taskId);
}

function findCommentById(id) {
  return db.prepare(`${SELECT_WITH_USER_NAME} WHERE c.id = ?`).get(id);
}

function insertComment(taskId, userId, body) {
  const result = db.prepare(
    'INSERT INTO comments (task_id, user_id, body) VALUES (?, ?, ?)'
  ).run(taskId, userId, body);
  return findCommentById(result.lastInsertRowid);
}

module.exports = { listCommentsForTask, findCommentById, insertComment };
