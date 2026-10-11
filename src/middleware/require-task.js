const tasksService = require('../services/tasks');

/** Responds 404 unless the task identified by req.params.id exists. */
function requireTask(req, res, next) {
  tasksService.assertTaskExists(parseInt(req.params.id));
  next();
}

module.exports = { requireTask };
