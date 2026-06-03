var authService = require('../services/auth-service');
var config = require('../config');
var getBearerToken = require('../utils/request').getBearerToken;
var getCookieToken = require('../utils/request').getCookieToken;

function ensureAuth(req, res, next) {
  try {
    req.auth = authService.verifyBearerToken(
      getBearerToken(req) || getCookieToken(req, config.auth.cookieName)
    );
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  ensureAuth: ensureAuth
};
