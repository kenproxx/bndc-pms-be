var execute = require('../db/turso').execute;
var appendFilter = require('./api-helpers').appendFilter;
var parsePagination = require('./api-helpers').parsePagination;
var toPagedResponse = require('./api-helpers').toPagedResponse;

async function list(query) {
  var where = ['cm.deleted_at is null'];
  var args = [];
  var pagination = parsePagination(query);

  appendFilter(where, args, 'cm.class_id', query.classId);
  appendFilter(where, args, 'cm.person_id', query.personId);

  var fromSql = 'from class_member cm ' +
    'join person p on p.id = cm.person_id ' +
    'left join baptismal_name bn on bn.id = p.ten_thanh ' +
    'left join class c on c.id = cm.class_id ' +
    'where ' + where.join(' and ');
  var countResult = await execute('select count(*) as total ' + fromSql, args);
  var result = await execute(
    'select cm.id, cm.class_id, cm.person_id, bn.ten_thanh, p.ho_va_ten_dem, p.ten, p.ngay_sinh, c.ten_lop as lop ' +
      fromSql + ' order by c.ten_lop, p.ten, p.ho_va_ten_dem limit ? offset ?',
    args.concat([pagination.limit, pagination.offset])
  );

  return toPagedResponse(result.rows, countResult.rows[0].total, pagination);
}

module.exports = {
  list: list
};
