var express = require('express');
var tnttClassController = require('../controllers/tntt-class-controller');
var asyncHandler = require('../utils/async-handler');

var router = express.Router();

router.get('/', asyncHandler(tnttClassController.list));

module.exports = router;
