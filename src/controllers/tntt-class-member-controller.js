var tnttClassMemberService = require('../services/tntt-class-member-service');

async function list(req, res) {
  res.json(await tnttClassMemberService.list(req.query));
}

module.exports = {
  list: list
};
