if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ quiet: true });
}

var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var config = require('./src/config');
var authRouter = require('./src/routes/auth');
var dbRouter = require('./src/routes/db');
var healthRouter = require('./src/routes/health');

var app = express();

app.disable('x-powered-by');

app.use(logger(config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(cors(config.cors));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/db', dbRouter);

app.get('/', function(req, res) {
  res.json({
    ok: true,
    name: 'bndc-pms-be',
    endpoints: ['/api/health', '/api/auth/token', '/api/db/query']
  });
});

app.use(function(req, res, next) {
  next(createError(404, 'Route not found'));
});

app.use(function(err, req, res, next) {
  var status = err.status || err.statusCode || 500;
  var expose = err.expose || status < 500 || config.nodeEnv !== 'production';

  res.status(status).json({
    ok: false,
    error: {
      message: expose ? err.message : 'Internal server error',
      status: status
    }
  });
});

module.exports = app;
