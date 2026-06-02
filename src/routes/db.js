var express = require('express');
var dbController = require('../controllers/db-controller');
var ensureAuth = require('../middleware/auth').ensureAuth;
var asyncHandler = require('../utils/async-handler');

var router = express.Router();

router.use(ensureAuth);

router.post('/query', asyncHandler(dbController.query));

module.exports = router;
