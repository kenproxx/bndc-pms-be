var express = require('express');
var addressesController = require('../controllers/addresses-controller');
var asyncHandler = require('../utils/async-handler');

var router = express.Router();

router.put('/', asyncHandler(addressesController.save));
router.delete('/', asyncHandler(addressesController.remove));

module.exports = router;
