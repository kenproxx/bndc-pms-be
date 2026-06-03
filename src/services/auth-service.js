var createError = require('http-errors');
var crypto = require('crypto');
var jwt = require('jsonwebtoken');
var config = require('../config');
var authConstants = require('../constants/auth');

function hashSha256(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

function safeEqual(value, expected) {
  var valueBuffer = Buffer.from(String(value));
  var expectedBuffer = Buffer.from(String(expected));

  if (valueBuffer.length !== expectedBuffer.length) return false;
  return crypto.timingSafeEqual(valueBuffer, expectedBuffer);
}

function assertLoginConfigured() {
  if (!config.auth.username || (!config.auth.password && !config.auth.passwordSha256)) {
    throw createError(500, 'Username/password auth is not configured');
  }

  if (!config.jwtSecret) {
    throw createError(500, 'JWT_SECRET is not configured');
  }
}

function parseExpiresInSeconds(expiresIn) {
  var value = String(expiresIn || '').trim();
  var match = value.match(/^(\d+)(ms|s|m|h|d)?$/i);

  if (!match) return null;

  var amount = Number(match[1]);
  var unit = (match[2] || 's').toLowerCase();

  if (unit === 'ms') return Math.floor(amount / 1000);
  if (unit === 's') return amount;
  if (unit === 'm') return amount * 60;
  if (unit === 'h') return amount * 60 * 60;
  if (unit === 'd') return amount * 24 * 60 * 60;

  return null;
}

function formatExpiresAt(token) {
  var payload = jwt.decode(token);
  return payload && payload.exp ? new Date(payload.exp * 1000).toISOString() : null;
}

function getUserFromUsername(username) {
  var uid = hashSha256(username).slice(0, 24);

  return {
    id: uid,
    username: username,
    role: config.auth.role
  };
}

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

function createLoginSession(username, password) {
  assertLoginConfigured();

  if (!username || !password) {
    throw createError(400, 'username and password are required');
  }

  if (!safeEqual(username, config.auth.username)) {
    throw createError(401, 'Invalid username or password');
  }

  if (config.auth.passwordSha256) {
    if (!safeEqual(hashSha256(password), config.auth.passwordSha256)) {
      throw createError(401, 'Invalid username or password');
    }
  } else if (!safeEqual(password, config.auth.password)) {
    throw createError(401, 'Invalid username or password');
  }

  var user = getUserFromUsername(username);
  var accessToken = jwt.sign(
    {
      scope: authConstants.JWT_SCOPE_AUTH,
      username: user.username,
      role: user.role,
      uid: user.id
    },
    config.jwtSecret,
    {
      subject: user.id,
      expiresIn: config.jwtExpiresIn
    }
  );
  var refreshToken = jwt.sign(
    {
      scope: authConstants.JWT_SCOPE_REFRESH,
      uid: user.id
    },
    config.jwtSecret,
    {
      subject: user.id,
      expiresIn: config.jwtRefreshExpiresIn
    }
  );

  return {
    accessToken: accessToken,
    refreshToken: refreshToken,
    tokenType: 'Bearer',
    expiresIn: config.jwtExpiresIn,
    expiresInSeconds: parseExpiresInSeconds(config.jwtExpiresIn),
    expiresAt: formatExpiresAt(accessToken),
    refreshExpiresIn: config.jwtRefreshExpiresIn,
    refreshExpiresInSeconds: parseExpiresInSeconds(config.jwtRefreshExpiresIn),
    refreshExpiresAt: formatExpiresAt(refreshToken),
    user: user
  };
}

module.exports = {
  verifyBearerToken: verifyBearerToken,
  createTokenFromApiKey: createTokenFromApiKey,
  createLoginSession: createLoginSession,
  parseExpiresInSeconds: parseExpiresInSeconds
};
