var express = require('express');
var householdMembersController = require('../controllers/household-members-controller');
var asyncHandler = require('../utils/async-handler');

var router = express.Router();

router.get('/', asyncHandler(householdMembersController.list));

module.exports = router;
