var addressesService = require('../services/addresses-service');

async function list(req, res) {
  res.json(await addressesService.list(req.query));
}

async function create(req, res) {
  res.status(201).json(await addressesService.create(req.body));
}

async function save(req, res) {
  var result = await addressesService.save(req.body);
  res.status(result.created ? 201 : 200).json(result.item);
}

async function remove(req, res) {
  res.json(await addressesService.remove(req.query.id, req.auth && req.auth.sub));
}

module.exports = {
  list: list,
  create: create,
  save: save,
  remove: remove
};
