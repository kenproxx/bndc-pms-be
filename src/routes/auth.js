var express = require('express');
var authController = require('../controllers/auth-controller');
var ensureAuth = require('../middleware/auth').ensureAuth;

var router = express.Router();

router.post('/login', authController.login);
router.post('/token', authController.issueToken);
router.get('/me', ensureAuth, authController.getCurrentAuth);

module.exports = router;
