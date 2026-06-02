var createClient = require('@libsql/client').createClient;
var config = require('../config');

var client;

function getDb() {
  if (!config.turso.url || !config.turso.authToken) {
    throw new Error('Turso is not configured. Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN.');
  }

  if (!client) {
    client = createClient({
      url: config.turso.url,
      authToken: config.turso.authToken
    });
  }

  return client;
}

async function execute(sql, args) {
  return getDb().execute({
    sql: sql,
    args: args || []
  });
}

module.exports = {
  getDb: getDb,
  execute: execute
};
