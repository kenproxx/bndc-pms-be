var dbService = require('../services/db-service');
var sendOk = require('../utils/http').sendOk;

async function query(req, res) {
  var result = await dbService.runQuery(req.body);

  sendOk(res, result);
}

module.exports = {
  query: query
};
