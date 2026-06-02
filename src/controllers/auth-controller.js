var authService = require('../services/auth-service');
var sendOk = require('../utils/http').sendOk;
var getBearerToken = require('../utils/request').getBearerToken;

function issueToken(req, res) {
  var apiKey = getBearerToken(req) || req.body.apiKey;
  var token = authService.createTokenFromApiKey(apiKey);

  sendOk(res, token);
}

function getCurrentAuth(req, res) {
  sendOk(res, {
    auth: req.auth
  });
}

module.exports = {
  issueToken: issueToken,
  getCurrentAuth: getCurrentAuth
};
