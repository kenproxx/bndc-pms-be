var createError = require('http-errors');
var config = require('../config');
var execute = require('../db/turso').execute;
var validateSqlQuery = require('../validators/sql-validator').validateSqlQuery;
var normalizeArgs = require('../validators/sql-validator').normalizeArgs;

async function runQuery(input) {
  var sql = input.sql;
  var args = normalizeArgs(input.args);

  validateSqlQuery(sql, {
    allowWriteSql: config.allowWriteSql
  });

  try {
    var result = await execute(sql, args);

    return {
      rows: result.rows,
      rowsAffected: result.rowsAffected,
      lastInsertRowid: result.lastInsertRowid ? String(result.lastInsertRowid) : null
    };
  } catch (error) {
    throw createError(500, error.message || 'Database query failed');
  }
}

async function checkConnection() {
  var result = await execute('select 1 as healthy');
  return result.rows[0];
}

module.exports = {
  runQuery: runQuery,
  checkConnection: checkConnection
};
