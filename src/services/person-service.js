var execute = require('../db/turso').execute;
var personName = require('./api-helpers').personName;
var parsePagination = require('./api-helpers').parsePagination;
var toPagedResponse = require('./api-helpers').toPagedResponse;

async function list(query) {
  var where = ['p.deleted_at is null'];
  var args = [];
  var pagination = parsePagination(query);

  if (query.q) {
    where.push('(' + personName('') + ' like ? or p.email like ? or p.phone like ? or p.dia_chi like ?)');
    args.push('%' + query.q + '%', '%' + query.q + '%', '%' + query.q + '%', '%' + query.q + '%');
  }

  var fromSql = 'from person p left join baptismal_name bn on bn.id = p.ten_thanh where ' + where.join(' and ');
  var countResult = await execute('select count(*) as total ' + fromSql, args);
  var result = await execute(
    'select p.id, bn.ten_thanh, p.ho_va_ten_dem, p.ten, p.ngay_sinh, p.ngay_mat, p.ngay_bon_mang, ' +
      'p.noi_sinh, p.gioi_tinh, p.ngay_rua_toi, p.noi_rua_toi, p.nguoi_rua_toi, p.so_so_rua_toi, ' +
      'p.ngay_ruoc_le, p.noi_ruoc_le, p.nguoi_cho_ruoc_le, p.so_so_ruoc_le, p.ngay_them_suc, ' +
      'p.noi_them_suc, p.nguoi_them_suc, p.so_so_them_suc, p.nguoi_do_dau_rua_toi, ' +
      'p.nguoi_do_dau_them_suc, p.id_giao_xu, p.id_giao_ho, p.email, p.phone, p.dia_chi, ' +
      'p.tinh_trang, p.tinh_trang_hon_nhan, p.id_phoi_ngau, p.created_at, p.created_by, ' +
      'p.updated_at, p.updated_by, p.deleted_at, p.deleted_by ' +
      fromSql + ' order by p.ten, p.ho_va_ten_dem limit ? offset ?',
    args.concat([pagination.limit, pagination.offset])
  );

  return toPagedResponse(result.rows, countResult.rows[0].total, pagination);
}

module.exports = {
  list: list
};
