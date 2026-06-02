var tnttClassService = require('../services/tntt-class-service');

async function list(req, res) {
  res.json(await tnttClassService.list(req.query));
}

module.exports = {
  list: list
};
