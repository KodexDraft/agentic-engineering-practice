const projectsQueries = require('../db/queries/projects');
const { isNonEmptyString } = require('../utils/validation');

function listProjects() {
  return projectsQueries.listProjects();
}

function getProjectStats(projectId) {
  const stats = { total: 0, active: 0, completed: 0, archived: 0 };
  for (const row of projectsQueries.countTasksByStatus(projectId)) {
    stats[row.status] = row.count;
    stats.total += row.count;
  }
  return stats;
}

function getProject(id) {
  const project = projectsQueries.findProjectById(id);
  if (!project) throw { status: 404, message: 'Project not found' };
  return { ...project, stats: getProjectStats(id) };
}

function createProject({ name, description, owner_id }) {
  if (!name || !isNonEmptyString(name)) throw { status: 400, message: 'name is required' };
  return projectsQueries.insertProject(name, description || null, owner_id || null);
}

function updateProject(id, data) {
  const existing = projectsQueries.findProjectById(id);
  if (!existing) throw { status: 404, message: 'Project not found' };

  const name = data.name !== undefined ? data.name : existing.name;
  const description = data.description !== undefined ? data.description : existing.description;
  const ownerId = data.owner_id !== undefined ? data.owner_id : existing.owner_id;
  return projectsQueries.updateProject(id, name, description, ownerId);
}

function deleteProject(id) {
  if (projectsQueries.deleteProject(id) === 0) throw { status: 404, message: 'Project not found' };
  return { deleted: true };
}

module.exports = { listProjects, getProject, createProject, updateProject, deleteProject };
