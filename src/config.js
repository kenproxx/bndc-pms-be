var requiredInProduction = ['API_KEY', 'JWT_SECRET', 'TURSO_DATABASE_URL', 'TURSO_AUTH_TOKEN'];

var nodeEnv = process.env.NODE_ENV || 'development';

if (nodeEnv === 'production') {
  requiredInProduction.forEach(function(name) {
    if (!process.env[name]) {
      throw new Error('Missing required environment variable: ' + name);
    }
  });
}

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
  apiKey: process.env.API_KEY || '',
  jwtSecret: process.env.JWT_SECRET || process.env.API_KEY || '',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
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
