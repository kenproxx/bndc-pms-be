var express = require('express');
var tnttController = require('../controllers/tntt-controller');
var asyncHandler = require('../utils/async-handler');

var router = express.Router();

router.get('/', asyncHandler(tnttController.list));

module.exports = router;
