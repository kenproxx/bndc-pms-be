var execute = require('../db/turso').execute;
var appendFilter = require('./api-helpers').appendFilter;

async function list(query) {
  var where = ['t.deleted_at is null'];
  var args = [];

  appendFilter(where, args, 't.dia_chi_cap_bac', query.addressLevelId);

  var result = await execute(
    'select t.id, t.ten_goi, t.dia_chi_cap_bac, t.tuyen_uy, t.thong_tin_ban_dieu_hanh ' +
      'from tntt t where ' + where.join(' and ') + ' order by t.ten_goi',
    args
  );

  return result.rows;
}

module.exports = {
  list: list
};
