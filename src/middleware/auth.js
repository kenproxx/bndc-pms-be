var authService = require('../services/auth-service');
var getBearerToken = require('../utils/request').getBearerToken;

function ensureAuth(req, res, next) {
  try {
    req.auth = authService.verifyJwtToken(getBearerToken(req));
    return next();
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  ensureAuth: ensureAuth
};
