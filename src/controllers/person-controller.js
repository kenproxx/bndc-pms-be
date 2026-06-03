var personService = require('../services/person-service');

async function list(req, res) {
  res.json(await personService.list(req.query));
}

module.exports = {
  list: list
};
