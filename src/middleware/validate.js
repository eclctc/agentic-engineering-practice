const { isNonEmptyString } = require('../utils/validators');
const { VALID_TASK_STATUSES } = require('../utils/constants');

/** Rejects with 400 unless req.body[field] is a non-empty string. */
function requireNonEmptyString(field) {
  return (req, res, next) => {
    if (!isNonEmptyString(req.body[field])) {
      return next({ status: 400, message: `${field} is required` });
    }
    next();
  };
}

/** Rejects with 400 unless req.body[field] is present (truthy). */
function requireField(field) {
  return (req, res, next) => {
    if (!req.body[field]) {
      return next({ status: 400, message: `${field} is required` });
    }
    next();
  };
}

/** Rejects with 400 when a status is supplied in req[source] and is not a valid task status. */
function validateTaskStatus(source) {
  return (req, res, next) => {
    const { status } = req[source];
    if (status && !VALID_TASK_STATUSES.includes(status)) {
      return next({ status: 400, message: `status must be one of: ${VALID_TASK_STATUSES.join(', ')}` });
    }
    next();
  };
}

module.exports = { requireNonEmptyString, requireField, validateTaskStatus };
