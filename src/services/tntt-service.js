var execute = require('../db/turso').execute;
var appendFilter = require('./api-helpers').appendFilter;
var parsePagination = require('./api-helpers').parsePagination;
var toPagedResponse = require('./api-helpers').toPagedResponse;

async function list(query) {
  var where = ['t.deleted_at is null'];
  var args = [];
  var pagination = parsePagination(query);

  appendFilter(where, args, 't.dia_chi_cap_bac', query.addressLevelId);

  var fromSql = 'from tntt t where ' + where.join(' and ');
  var countResult = await execute('select count(*) as total ' + fromSql, args);
  var result = await execute(
    'select t.id, t.ten_goi, t.dia_chi_cap_bac, t.tuyen_uy, t.thong_tin_ban_dieu_hanh ' +
      fromSql + ' order by t.ten_goi limit ? offset ?',
    args.concat([pagination.limit, pagination.offset])
  );

  return toPagedResponse(result.rows, countResult.rows[0].total, pagination);
}

module.exports = {
  list: list
};
