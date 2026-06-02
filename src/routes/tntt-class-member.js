var express = require('express');
var tnttClassMemberController = require('../controllers/tntt-class-member-controller');
var asyncHandler = require('../utils/async-handler');

var router = express.Router();

router.get('/', asyncHandler(tnttClassMemberController.list));

module.exports = router;
