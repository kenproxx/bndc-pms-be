var createError = require('http-errors');

var READ_SQL_PATTERN = /^\s*(select|with|pragma)\b/i;

function normalizeArgs(args) {
  if (args === undefined || args === null) return [];
  if (Array.isArray(args)) return args;
  if (typeof args === 'object') return args;
  throw createError(400, 'args must be an array or object');
}

function validateSqlQuery(sql, options) {
  if (!sql || typeof sql !== 'string') {
    throw createError(400, 'sql is required');
  }

  if (!options.allowWriteSql && !READ_SQL_PATTERN.test(sql)) {
    throw createError(403, 'Only read SQL is allowed. Set ALLOW_WRITE_SQL=true to enable writes.');
  }
}

module.exports = {
  normalizeArgs: normalizeArgs,
  validateSqlQuery: validateSqlQuery
};
