var execute = require('../db/turso').execute;
var appendFilter = require('./api-helpers').appendFilter;
var personName = require('./api-helpers').personName;

async function list(query) {
  var where = ['c.deleted_at is null'];
  var args = [];

  appendFilter(where, args, 'c.id_xu_doan', query.xuDoanId);
  appendFilter(where, args, 'c.id_nien_hoc', query.nienHocId);
  appendFilter(where, args, 'c.nganh', query.nganh);

  var result = await execute(
    'select c.id, c.id_xu_doan, t.ten_goi as ten_xu_doan, c.id_nien_hoc, nh.ten_nien_hoc, c.ten_lop, c.nganh, ' +
      'c.glv_chu_nhiem as glv_chu_nhiem_id, ' + personName('cn') + ' as glv_chu_nhiem, ' +
      'c.glv_1 as glv_1_id, ' + personName('g1') + ' as glv_1, ' +
      'c.glv_2 as glv_2_id, ' + personName('g2') + ' as glv_2, ' +
      'c.glv_3 as glv_3_id, ' + personName('g3') + ' as glv_3 ' +
      'from class c ' +
      'left join tntt t on t.id = c.id_xu_doan ' +
      'left join nien_hoc nh on nh.id = c.id_nien_hoc ' +
      'left join person cnp on cnp.id = c.glv_chu_nhiem left join baptismal_name cnbn on cnbn.id = cnp.ten_thanh ' +
      'left join person g1p on g1p.id = c.glv_1 left join baptismal_name g1bn on g1bn.id = g1p.ten_thanh ' +
      'left join person g2p on g2p.id = c.glv_2 left join baptismal_name g2bn on g2bn.id = g2p.ten_thanh ' +
      'left join person g3p on g3p.id = c.glv_3 left join baptismal_name g3bn on g3bn.id = g3p.ten_thanh ' +
      'where ' + where.join(' and ') + ' order by nh.ten_nien_hoc, c.nganh, c.ten_lop',
    args
  );

  return result.rows;
}

module.exports = {
  list: list
};
