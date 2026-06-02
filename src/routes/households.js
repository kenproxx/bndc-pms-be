var express = require('express');
var householdsController = require('../controllers/households-controller');
var asyncHandler = require('../utils/async-handler');

var router = express.Router();

router.get('/', asyncHandler(householdsController.list));

module.exports = router;
