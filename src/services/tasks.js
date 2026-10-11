const tasksQueries = require('../db/queries/tasks');
const projectsQueries = require('../db/queries/projects');
const usersQueries = require('../db/queries/users');
const tagsQueries = require('../db/queries/tags');
const commentsQueries = require('../db/queries/comments');
const { HttpError } = require('../utils/http-error');

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

function listTasks({ status, project_id, assignee_id, page, page_size }) {
  const limit = Math.min(MAX_PAGE_SIZE, parseInt(page_size) || DEFAULT_PAGE_SIZE);
  const offset = ((parseInt(page) || 1) - 1) * limit;
  return tasksQueries.listTasks({
    status: status || undefined,
    projectId: project_id ? parseInt(project_id) : undefined,
    assigneeId: assignee_id ? parseInt(assignee_id) : undefined,
    limit,
    offset
  });
}

/** Throws 404 when the task does not exist. */
function assertTaskExists(id) {
  if (!tasksQueries.findTaskById(id)) throw new HttpError(404, 'Task not found');
}

function getTaskById(id) {
  const task = tasksQueries.findTaskById(id);
  if (!task) throw new HttpError(404, 'Task not found');
  task.tags = tagsQueries.listTagsForTask(id);
  task.comments = commentsQueries.listCommentsForTask(id);
  return task;
}

function createTask({ title, description, project_id, assignee_id, due_date }) {
  if (project_id && !projectsQueries.findProjectById(parseInt(project_id))) {
    throw new HttpError(400, 'project not found');
  }
  if (assignee_id && !usersQueries.findUserById(parseInt(assignee_id))) {
    throw new HttpError(400, 'assignee not found');
  }
  return tasksQueries.insertTask({
    title,
    description: description || null,
    projectId: project_id ? parseInt(project_id) : null,
    assigneeId: assignee_id ? parseInt(assignee_id) : null,
    dueDate: due_date || null
  });
}

function resolveCompletedAt(existing, updatedStatus) {
  if (updatedStatus !== 'completed') return null;
  return existing.status !== 'completed' ? new Date().toISOString() : existing.completed_at;
}

/** Updates a task that is known to exist. Sets completed_at on the transition to completed. */
function updateTask(id, { title, description, status, project_id, assignee_id, due_date }) {
  const existing = tasksQueries.findTaskById(id);
  const updatedStatus = status !== undefined ? status : existing.status;
  return tasksQueries.updateTask(id, {
    title: title !== undefined ? title : existing.title,
    description: description !== undefined ? description : existing.description,
    status: updatedStatus,
    projectId: project_id !== undefined ? project_id : existing.project_id,
    assigneeId: assignee_id !== undefined ? assignee_id : existing.assignee_id,
    dueDate: due_date !== undefined ? due_date : existing.due_date,
    completedAt: resolveCompletedAt(existing, updatedStatus)
  });
}

function deleteTask(id) {
  if (tasksQueries.deleteTask(id) === 0) throw new HttpError(404, 'Task not found');
  return { deleted: true };
}

module.exports = { listTasks, assertTaskExists, getTaskById, createTask, updateTask, deleteTask };
