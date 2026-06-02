var express = require('express');
var addressesController = require('../controllers/addresses-controller');
var asyncHandler = require('../utils/async-handler');

var router = express.Router();

router.get('/', asyncHandler(addressesController.list));
router.post('/', asyncHandler(addressesController.create));

module.exports = router;
