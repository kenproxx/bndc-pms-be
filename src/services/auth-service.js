var createError = require('http-errors');
var bcrypt = require('bcryptjs');
var jwt = require('jsonwebtoken');
var config = require('../config');
var authConstants = require('../constants/auth');
var execute = require('../db/turso').execute;

function assertLoginConfigured() {
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

async function getUserFromUsername(username) {
  var result = await execute(
    'select u.id, u.username, u.password_hash, u.address_id, t.id as tntt_id ' +
      'from "user" u ' +
      'left join tntt t on t.dia_chi_cap_bac = u.address_id and t.deleted_at is null ' +
      'where u.username = ? and u.deleted_at is null ' +
      'limit 1',
    [username]
  );
  var row = result.rows[0];

  if (!row) {
    throw createError(401, 'Invalid username or password');
  }

  return {
    id: row.id,
    username: row.username,
    passwordHash: row.password_hash,
    role: config.auth.role,
    addressId: row.address_id,
    tnttId: row.tntt_id
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

function verifyJwtToken(token) {
  if (!token) {
    throw createError(401, 'Missing Authorization bearer token');
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

async function createLoginSession(username, password) {
  assertLoginConfigured();

  if (!username || !password) {
    throw createError(400, 'username and password are required');
  }

  var user = await getUserFromUsername(username);
  var validPassword = await bcrypt.compare(password, user.passwordHash);
  if (!validPassword) {
    throw createError(401, 'Invalid username or password');
  }

  var accessToken = jwt.sign(
    {
      scope: authConstants.JWT_SCOPE_AUTH,
      username: user.username,
      uid: user.id,
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
    user: {
      id: user.id,
      username: user.username,
      role: user.role,
      addressId: user.addressId,
      tnttId: user.tnttId,
    }
  };
}

module.exports = {
  verifyBearerToken: verifyBearerToken,
  verifyJwtToken: verifyJwtToken,
  createTokenFromApiKey: createTokenFromApiKey,
  createLoginSession: createLoginSession,
  parseExpiresInSeconds: parseExpiresInSeconds
};
