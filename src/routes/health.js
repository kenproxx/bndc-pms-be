var express = require('express');
var healthController = require('../controllers/health-controller');
var asyncHandler = require('../utils/async-handler');

var router = express.Router();

router.get('/', healthController.check);
router.get('/config', healthController.checkConfig);
router.get('/db', asyncHandler(healthController.checkDb));

module.exports = router;
