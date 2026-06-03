var express = require('express');
var personController = require('../controllers/person-controller');
var asyncHandler = require('../utils/async-handler');

var router = express.Router();

router.get('/', asyncHandler(personController.list));

module.exports = router;
