var execute = require('../db/turso').execute;
var appendFilter = require('./api-helpers').appendFilter;
var personName = require('./api-helpers').personName;
var parsePagination = require('./api-helpers').parsePagination;
var toPagedResponse = require('./api-helpers').toPagedResponse;

async function list(query) {
  var where = ['h.deleted_at is null'];
  var args = [];
  var pagination = parsePagination(query);

  appendFilter(where, args, 'h.id_dia_chi', query.addressId);
  if (query.tenChuHo) {
    where.push(personName('head') + ' like ?');
    args.push('%' + query.tenChuHo + '%');
  }
  if (query.q) {
    where.push('(' + personName('head') + ' like ? or a.ten_dia_danh like ? or h.ghi_chu like ?)');
    args.push('%' + query.q + '%', '%' + query.q + '%', '%' + query.q + '%');
  }

  var fromSql = 'from household h ' +
    'left join address a on a.id = h.id_dia_chi ' +
    'left join person headp on headp.id = h.id_chu_ho ' +
    'left join baptismal_name headbn on headbn.id = headp.ten_thanh ' +
    'where ' + where.join(' and ');
  var countResult = await execute('select count(*) as total ' + fromSql, args);
  var result = await execute(
    'select h.id, h.id_dia_chi, a.ten_dia_danh as dia_chi_chi_tiet, h.id_chu_ho, ' +
      personName('head') + ' as ten_chu_ho, h.ghi_chu ' +
      fromSql + ' order by ten_chu_ho, h.id limit ? offset ?',
    args.concat([pagination.limit, pagination.offset])
  );

  return toPagedResponse(result.rows, countResult.rows[0].total, pagination);
}

module.exports = {
  list: list
};
