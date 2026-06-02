var householdsService = require('../services/households-service');

async function list(req, res) {
  res.json(await householdsService.list(req.query));
}

module.exports = {
  list: list
};
