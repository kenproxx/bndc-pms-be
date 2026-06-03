var accountService = require('../services/account-service');

async function create(req, res) {
  res.status(201).json(await accountService.create(req.body));
}

module.exports = {
  create: create
};
