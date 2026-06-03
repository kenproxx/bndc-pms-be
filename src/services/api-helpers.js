var crypto = require('crypto');
var createError = require('http-errors');

var DEFAULT_LIMIT = 20;
var MAX_LIMIT = 100;

function makeId() {
  return crypto.randomBytes(16).toString('base64url').slice(0, 26);
}

function appendFilter(where, args, column, value) {
  if (value !== undefined && value !== null && value !== '') {
    where.push(column + ' = ?');
    args.push(value);
  }
}

function personName(alias) {
  return "trim(coalesce(" + alias + "bn.ten_thanh || ' ', '') || coalesce(" + alias + "p.ho_va_ten_dem || ' ', '') || coalesce(" + alias + "p.ten, ''))";
}

function parsePositiveInteger(value, name, defaultValue) {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  var parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 1) {
    throw createError(400, name + ' must be a positive integer');
  }

  return parsed;
}

function parseNonNegativeInteger(value, name, defaultValue) {
  if (value === undefined || value === null || value === '') {
    return defaultValue;
  }

  var parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed < 0) {
    throw createError(400, name + ' must be a non-negative integer');
  }

  return parsed;
}

function parsePagination(query) {
  var limit = parsePositiveInteger(query.limit, 'limit', DEFAULT_LIMIT);
  if (limit > MAX_LIMIT) {
    throw createError(400, 'limit must be less than or equal to ' + MAX_LIMIT);
  }

  var page = parsePositiveInteger(query.page, 'page', 1);
  var offset = query.offset !== undefined && query.offset !== null && query.offset !== ''
    ? parseNonNegativeInteger(query.offset, 'offset', 0)
    : (page - 1) * limit;

  return {
    limit: limit,
    offset: offset,
    page: Math.floor(offset / limit) + 1
  };
}

function toPagedResponse(items, total, pagination) {
  return {
    total: Number(total) || 0,
    page: pagination.page,
    limit: pagination.limit,
    offset: pagination.offset,
    items: items
  };
}

module.exports = {
  makeId: makeId,
  appendFilter: appendFilter,
  personName: personName,
  parsePagination: parsePagination,
  toPagedResponse: toPagedResponse
};
