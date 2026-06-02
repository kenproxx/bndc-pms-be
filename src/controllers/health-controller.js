var dbService = require('../services/db-service');
var config = require('../config');
var sendOk = require('../utils/http').sendOk;

function check(req, res) {
  sendOk(res, {
    service: 'bndc-pms-be'
  });
}

async function checkDb(req, res) {
  var db = await dbService.checkConnection();

  sendOk(res, {
    db: db
  });
}

function checkConfig(req, res) {
  sendOk(res, {
    environment: config.nodeEnv,
    configured: config.missingEnv.length === 0,
    missingEnv: config.missingEnv
  });
}

module.exports = {
  check: check,
  checkDb: checkDb,
  checkConfig: checkConfig
};
