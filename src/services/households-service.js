var execute = require('../db/turso').execute;
var appendFilter = require('./api-helpers').appendFilter;
var personName = require('./api-helpers').personName;

async function list(query) {
  var where = ['h.deleted_at is null'];
  var args = [];

  appendFilter(where, args, 'h.id_dia_chi', query.addressId);
  if (query.tenChuHo) {
    where.push(personName('head') + ' like ?');
    args.push('%' + query.tenChuHo + '%');
  }

  var result = await execute(
    'select h.id, h.id_dia_chi, a.ten_dia_danh as dia_chi_chi_tiet, h.id_chu_ho, ' +
      personName('head') + ' as ten_chu_ho, h.ghi_chu ' +
      'from household h ' +
      'left join address a on a.id = h.id_dia_chi ' +
      'left join person headp on headp.id = h.id_chu_ho ' +
      'left join baptismal_name headbn on headbn.id = headp.ten_thanh ' +
      'where ' + where.join(' and ') + ' order by ten_chu_ho, h.id',
    args
  );

  return result.rows;
}

module.exports = {
  list: list
};
