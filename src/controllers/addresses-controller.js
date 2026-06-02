var addressesService = require('../services/addresses-service');

async function list(req, res) {
  res.json(await addressesService.list(req.query));
}

async function create(req, res) {
  res.status(201).json(await addressesService.create(req.body));
}

module.exports = {
  list: list,
  create: create
};
