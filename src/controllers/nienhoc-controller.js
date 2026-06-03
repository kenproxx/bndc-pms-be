var nienhocService = require('../services/nienhoc-service');

async function list(req, res) {
  res.json(await nienhocService.list(req.query));
}

async function create(req, res) {
  res.status(201).json(await nienhocService.create(req.body));
}

module.exports = {
  list: list,
  create: create
};
