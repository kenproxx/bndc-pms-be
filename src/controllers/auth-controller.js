var authService = require('../services/auth-service');
var config = require('../config');
var sendOk = require('../utils/http').sendOk;
var getBearerToken = require('../utils/request').getBearerToken;

function getCookieOptions(expiresInSeconds) {
  var options = {
    httpOnly: true,
    secure: config.nodeEnv === 'production',
    sameSite: 'lax',
    path: '/'
  };

  if (expiresInSeconds !== null) {
    options.maxAge = expiresInSeconds * 1000;
  }

  return options;
}

function issueToken(req, res) {
  var apiKey = getBearerToken(req) || req.body.apiKey;
  var token = authService.createTokenFromApiKey(apiKey);

  sendOk(res, token);
}

function login(req, res) {
  var body = req.body || {};
  var session = authService.createLoginSession(body.username, body.password);

  res.cookie(config.auth.cookieName, session.accessToken, getCookieOptions(session.expiresInSeconds));
  res.cookie(
    config.auth.refreshCookieName,
    session.refreshToken,
    getCookieOptions(session.refreshExpiresInSeconds)
  );
  sendOk(res, {
    accessToken: session.accessToken,
    tokenType: session.tokenType,
    expiresIn: session.expiresIn,
    expiresInSeconds: session.expiresInSeconds,
    expiresAt: session.expiresAt,
    refreshToken: {
      token: session.refreshToken,
      cookieName: config.auth.refreshCookieName,
      expiresIn: session.refreshExpiresIn,
      expiresInSeconds: session.refreshExpiresInSeconds,
      expiresAt: session.refreshExpiresAt,
      httpOnly: true
    },
    user: session.user
  });
}

function getCurrentAuth(req, res) {
  sendOk(res, {
    auth: req.auth
  });
}

module.exports = {
  issueToken: issueToken,
  login: login,
  getCurrentAuth: getCurrentAuth
};
