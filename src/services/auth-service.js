var createError = require('http-errors');
var jwt = require('jsonwebtoken');
var config = require('../config');
var authConstants = require('../constants/auth');

function verifyBearerToken(token) {
  if (!token) {
    throw createError(401, 'Missing Authorization bearer token');
  }

  if (config.apiKey && token === config.apiKey) {
    return {
      type: 'apiKey',
      sub: authConstants.API_KEY_SUBJECT
    };
  }

  if (!config.jwtSecret) {
    throw createError(401, 'JWT is not configured');
  }

  try {
    var payload = jwt.verify(token, config.jwtSecret);

    return {
      type: 'jwt',
      sub: payload.sub,
      payload: payload
    };
  } catch (error) {
    throw createError(401, 'Invalid bearer token');
  }
}

function createTokenFromApiKey(apiKey) {
  if (!config.apiKey || apiKey !== config.apiKey) {
    throw createError(401, 'Invalid API key');
  }

  if (!config.jwtSecret) {
    throw createError(500, 'JWT_SECRET is not configured');
  }

  return {
    token: jwt.sign(
      {
        scope: authConstants.JWT_SCOPE_API
      },
      config.jwtSecret,
      {
        subject: authConstants.API_KEY_SUBJECT,
        expiresIn: config.jwtExpiresIn
      }
    ),
    tokenType: 'Bearer',
    expiresIn: config.jwtExpiresIn
  };
}

module.exports = {
  verifyBearerToken: verifyBearerToken,
  createTokenFromApiKey: createTokenFromApiKey
};
