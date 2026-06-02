var tnttService = require('../services/tntt-service');

async function list(req, res) {
  res.json(await tnttService.list(req.query));
}

module.exports = {
  list: list
};
