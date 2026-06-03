var express = require('express');
var accountController = require('../controllers/account-controller');
var asyncHandler = require('../utils/async-handler');

var router = express.Router();

router.post('/', asyncHandler(accountController.create));

module.exports = router;
