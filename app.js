if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config({ quiet: true });
}

var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors');

var config = require('./src/config');
var accountRouter = require('./src/routes/account');
var authRouter = require('./src/routes/auth');
var dbRouter = require('./src/routes/db');
var healthRouter = require('./src/routes/health');
var addressesRouter = require('./src/routes/addresses');
var householdsRouter = require('./src/routes/households');
var householdMembersRouter = require('./src/routes/household-members');
var nienhocRouter = require('./src/routes/nienhoc');
var personRouter = require('./src/routes/person');
var tnttRouter = require('./src/routes/tntt');
var tnttClassRouter = require('./src/routes/tntt-class');
var tnttClassMemberRouter = require('./src/routes/tntt-class-member');
var ensureAuth = require('./src/middleware/auth').ensureAuth;

var app = express();

app.disable('x-powered-by');

app.use(logger(config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(cors(config.cors));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use('/api/health', healthRouter);
app.use('/api/auth', authRouter);
app.use('/api/account', ensureAuth, accountRouter);
app.use('/api/db', ensureAuth, dbRouter);
app.use('/api/addresses', ensureAuth, addressesRouter);
app.use('/api/households', ensureAuth, householdsRouter);
app.use('/api/household-members', ensureAuth, householdMembersRouter);
app.use('/api/nienhoc', ensureAuth, nienhocRouter);
app.use('/api/person', ensureAuth, personRouter);
app.use('/api/tntt/class-member', ensureAuth, tnttClassMemberRouter);
app.use('/api/tntt/class', ensureAuth, tnttClassRouter);
app.use('/api/tntt', ensureAuth, tnttRouter);

app.get('/', function(req, res) {
  res.json({
    ok: true,
    name: 'bndc-pms-be',
    endpoints: ['/api/health', '/api/account', '/api/auth/login', '/api/auth/token', '/api/db/query', '/api/addresses', '/api/households', '/api/household-members', '/api/nienhoc', '/api/person', '/api/tntt']
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
    code: status === 400 ? 'BAD_REQUEST' : status === 401 ? 'UNAUTHORIZED' : status === 403 ? 'FORBIDDEN' : status === 404 ? 'NOT_FOUND' : status === 409 ? 'CONFLICT' : 'INTERNAL_SERVER_ERROR',
    message: expose ? err.message : 'Internal server error',
    error: {
      message: expose ? err.message : 'Internal server error',
      status: status
    }
  });
});

module.exports = app;
