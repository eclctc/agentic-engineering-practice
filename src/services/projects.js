const projectsQueries = require('../db/queries/projects');
const tasksQueries = require('../db/queries/tasks');
const { HttpError } = require('../utils/http-error');

function listProjects() {
  return projectsQueries.listProjects();
}

function getProjectById(id) {
  const project = projectsQueries.findProjectById(id);
  if (!project) throw new HttpError(404, 'Project not found');
  return project;
}

function getProjectWithStats(id) {
  const project = getProjectById(id);
  const stats = { total: 0, active: 0, completed: 0, archived: 0 };
  for (const row of tasksQueries.countTasksByStatus(id)) {
    stats[row.status] = row.count;
    stats.total += row.count;
  }
  return { ...project, stats };
}

function createProject({ name, description, owner_id }) {
  return projectsQueries.insertProject(name, description || null, owner_id || null);
}

function updateProject(id, { name, description, owner_id }) {
  const existing = getProjectById(id);
  return projectsQueries.updateProject(
    id,
    name !== undefined ? name : existing.name,
    description !== undefined ? description : existing.description,
    owner_id !== undefined ? owner_id : existing.owner_id
  );
}

function deleteProject(id) {
  if (projectsQueries.deleteProject(id) === 0) throw new HttpError(404, 'Project not found');
  return { deleted: true };
}

module.exports = { listProjects, getProjectWithStats, createProject, updateProject, deleteProject };
