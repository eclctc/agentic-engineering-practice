const tagsQueries = require('../db/queries/tags');
const { HttpError } = require('../utils/http-error');

function isUniqueViolation(err) {
  return err.message && err.message.includes('UNIQUE');
}

function listTags() {
  return tagsQueries.listTags();
}

function createTag(name) {
  try {
    return tagsQueries.insertTag(name.toLowerCase().trim());
  } catch (err) {
    if (isUniqueViolation(err)) throw new HttpError(409, 'tag already exists');
    throw err;
  }
}

function attachTagToTask(taskId, tagId) {
  if (!tagsQueries.findTagById(tagId)) throw new HttpError(404, 'Tag not found');
  try {
    tagsQueries.attachTagToTask(taskId, tagId);
  } catch (err) {
    if (isUniqueViolation(err)) throw new HttpError(409, 'tag already applied to this task');
    throw err;
  }
  return { task_id: taskId, tag_id: tagId };
}

function detachTagFromTask(taskId, tagId) {
  if (tagsQueries.detachTagFromTask(taskId, tagId) === 0) {
    throw new HttpError(404, 'Tag not applied to this task');
  }
  return { deleted: true };
}

module.exports = { listTags, createTag, attachTagToTask, detachTagFromTask };
