var nodeEnv = process.env.NODE_ENV || 'development';

var requiredEnv = ['API_KEY', 'JWT_SECRET', 'TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN'];

function parseBoolean(value, defaultValue) {
  if (value === undefined || value === null || value === '') return defaultValue;
  return ['1', 'true', 'yes', 'on'].indexOf(String(value).toLowerCase()) !== -1;
}

function parseCorsOrigin(value) {
  if (!value || value === '*') return true;
  return value.split(',').map(function(origin) {
    return origin.trim();
  }).filter(Boolean);
}

module.exports = {
  nodeEnv: nodeEnv,
  requiredEnv: requiredEnv,
  missingEnv: requiredEnv.filter(function(name) {
    return !process.env[name];
  }),
  apiKey: process.env.API_KEY || '',
  jwtSecret: process.env.JWT_SECRET || process.env.API_KEY || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '15m',
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  auth: {
    username: process.env.AUTH_USERNAME || '',
    password: process.env.AUTH_PASSWORD || '',
    passwordSha256: process.env.AUTH_PASSWORD_SHA256 || '',
    role: process.env.AUTH_ROLE || 'admin',
    cookieName: process.env.AUTH_COOKIE_NAME || 'access_token',
    refreshCookieName: process.env.AUTH_REFRESH_COOKIE_NAME || 'refresh_token'
  },
  turso: {
    url: process.env.TURSO_DATABASE_URL || '',
    authToken: process.env.TURSO_AUTH_TOKEN || ''
  },
  allowWriteSql: parseBoolean(process.env.ALLOW_WRITE_SQL, false),
  cors: {
    origin: parseCorsOrigin(process.env.CORS_ORIGIN),
    credentials: true
  }
};
