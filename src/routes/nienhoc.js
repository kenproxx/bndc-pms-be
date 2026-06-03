var express = require('express');
var nienhocController = require('../controllers/nienhoc-controller');
var asyncHandler = require('../utils/async-handler');

var router = express.Router();

router.get('/', asyncHandler(nienhocController.list));
router.post('/', asyncHandler(nienhocController.create));

module.exports = router;
