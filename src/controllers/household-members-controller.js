var householdMembersService = require('../services/household-members-service');

async function list(req, res) {
  res.json(await householdMembersService.list(req.query));
}

module.exports = {
  list: list
};
