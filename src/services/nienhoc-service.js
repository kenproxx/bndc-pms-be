var createError = require('http-errors');
var execute = require('../db/turso').execute;
var makeId = require('./api-helpers').makeId;
var parsePagination = require('./api-helpers').parsePagination;
var toPagedResponse = require('./api-helpers').toPagedResponse;

function validateCreate(input) {
  if (!input || typeof input !== 'object') {
    throw createError(400, 'Request body is required');
  }
  ['ten_nien_hoc', 'ngay_bat_dau_ki_1', 'ngay_ket_thuc_ki_1', 'ngay_bat_dau_ki_2', 'ngay_ket_thuc_ki_2'].forEach(function(field) {
    if (!input[field] || typeof input[field] !== 'string') {
      throw createError(400, field + ' is required');
    }
  });
  if (input.is_active !== undefined && input.is_active !== 0 && input.is_active !== 1) {
    throw createError(400, 'is_active must be 0 or 1');
  }
}

async function list(query) {
  var where = ['nh.deleted_at is null'];
  var args = [];
  var pagination = parsePagination(query);

  if (query.q) {
    where.push('(nh.ten_nien_hoc like ? or t.ten_goi like ?)');
    args.push('%' + query.q + '%', '%' + query.q + '%');
  }

  var fromSql = 'from nien_hoc nh left join tntt t on t.id = nh.id_tntt where ' + where.join(' and ');
  var countResult = await execute('select count(*) as total ' + fromSql, args);
  var result = await execute(
    'select nh.id, nh.id_tntt, t.ten_goi as ten_tntt, nh.ten_nien_hoc, nh.is_active, ' +
      'nh.ngay_bat_dau_ki_1, nh.ngay_ket_thuc_ki_1, nh.ngay_bat_dau_ki_2, nh.ngay_ket_thuc_ki_2 ' +
      fromSql + ' order by nh.ngay_bat_dau_ki_1 desc, nh.ten_nien_hoc limit ? offset ?',
    args.concat([pagination.limit, pagination.offset])
  );

  return toPagedResponse(result.rows, countResult.rows[0].total, pagination);
}

async function create(input) {
  validateCreate(input);

  var id = input.id || makeId();
  try {
    await execute(
      'insert into nien_hoc (id, id_tntt, ten_nien_hoc, is_active, ngay_bat_dau_ki_1, ngay_ket_thuc_ki_1, ngay_bat_dau_ki_2, ngay_ket_thuc_ki_2) values (?, ?, ?, ?, ?, ?, ?, ?)',
      [
        id,
        input.id_tntt || null,
        input.ten_nien_hoc,
        input.is_active === undefined ? 1 : input.is_active,
        input.ngay_bat_dau_ki_1,
        input.ngay_ket_thuc_ki_1,
        input.ngay_bat_dau_ki_2,
        input.ngay_ket_thuc_ki_2
      ]
    );
  } catch (error) {
    throw createError(error.message && error.message.indexOf('UNIQUE') !== -1 ? 409 : 400, error.message || 'Unable to create school year');
  }

  var result = await execute(
    'select nh.id, nh.id_tntt, t.ten_goi as ten_tntt, nh.ten_nien_hoc, nh.is_active, ' +
      'nh.ngay_bat_dau_ki_1, nh.ngay_ket_thuc_ki_1, nh.ngay_bat_dau_ki_2, nh.ngay_ket_thuc_ki_2 ' +
      'from nien_hoc nh left join tntt t on t.id = nh.id_tntt where nh.id = ? limit 1',
    [id]
  );
  return result.rows[0];
}

module.exports = {
  list: list,
  create: create
};
