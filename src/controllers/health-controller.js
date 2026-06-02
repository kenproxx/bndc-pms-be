var dbService = require('../services/db-service');
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

module.exports = {
  check: check,
  checkDb: checkDb
};
