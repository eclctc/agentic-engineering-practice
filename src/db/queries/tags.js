const { db } = require('../connection');

function listTags() {
  return db.prepare('SELECT * FROM tags ORDER BY name ASC').all();
}

function findTagById(id) {
  return db.prepare('SELECT * FROM tags WHERE id = ?').get(id);
}

function insertTag(name) {
  const result = db.prepare('INSERT INTO tags (name) VALUES (?)').run(name);
  return findTagById(result.lastInsertRowid);
}

function listTagsForTask(taskId) {
  return db.prepare(
    'SELECT t.* FROM tags t JOIN task_tags tt ON tt.tag_id = t.id WHERE tt.task_id = ?'
  ).all(taskId);
}

function attachTagToTask(taskId, tagId) {
  db.prepare('INSERT INTO task_tags (task_id, tag_id) VALUES (?, ?)').run(taskId, tagId);
}

/** Returns the number of rows deleted. */
function detachTagFromTask(taskId, tagId) {
  return db.prepare('DELETE FROM task_tags WHERE task_id = ? AND tag_id = ?').run(taskId, tagId).changes;
}

module.exports = { listTags, findTagById, insertTag, listTagsForTask, attachTagToTask, detachTagFromTask };
