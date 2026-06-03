var express = require('express');
var dbController = require('../controllers/db-controller');
var asyncHandler = require('../utils/async-handler');

var router = express.Router();

router.post('/query', asyncHandler(dbController.query));

module.exports = router;
