var createError = require('http-errors');
var execute = require('../db/turso').execute;
var appendFilter = require('./api-helpers').appendFilter;
var makeId = require('./api-helpers').makeId;
var parsePagination = require('./api-helpers').parsePagination;
var toPagedResponse = require('./api-helpers').toPagedResponse;

async function list(query) {
  var where = ['a.deleted_at is null'];
  var args = [];
  var pagination = parsePagination(query);

  appendFilter(where, args, 'a.id_parent', query.parentId);
  appendFilter(where, args, 'a.ten_dia_danh', query.tenDiaDanh);
  if (query.q) {
    where.push('(a.ten_dia_danh like ? or a.code like ?)');
    args.push('%' + query.q + '%', '%' + query.q + '%');
  }

  var countResult = await execute(
    'select count(*) as total from address a where ' + where.join(' and '),
    args
  );
  var result = await execute(
    'select a.* from address a where ' + where.join(' and ') + ' order by a.cap_bac, a.ten_dia_danh limit ? offset ?',
    args.concat([pagination.limit, pagination.offset])
  );

  return toPagedResponse(result.rows, countResult.rows[0].total, pagination);
}

function validateCreate(input) {
  if (!input || typeof input !== 'object') {
    throw createError(400, 'Request body is required');
  }
  if (!Number.isInteger(input.cap_bac) || input.cap_bac < 1 || input.cap_bac > 5) {
    throw createError(400, 'cap_bac must be an integer between 1 and 5');
  }
  if (!input.ten_dia_danh || typeof input.ten_dia_danh !== 'string') {
    throw createError(400, 'ten_dia_danh is required');
  }
  if (!input.code || typeof input.code !== 'string' || input.code.length > 2) {
    throw createError(400, 'code is required and must be at most 2 characters');
  }
}

async function create(input) {
  validateCreate(input);

  var id = input.id || makeId();
  try {
    await execute(
      'insert into address (id, cap_bac, ten_dia_danh, id_parent, code) values (?, ?, ?, ?, ?)',
      [id, input.cap_bac, input.ten_dia_danh, input.id_parent || null, input.code]
    );
  } catch (error) {
    throw createError(error.message && error.message.indexOf('UNIQUE') !== -1 ? 409 : 400, error.message || 'Unable to create address');
  }

  var result = await execute('select * from address where id = ? limit 1', [id]);
  return result.rows[0];
}

module.exports = {
  list: list,
  create: create
};
