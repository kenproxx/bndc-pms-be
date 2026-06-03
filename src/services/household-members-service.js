var execute = require('../db/turso').execute;
var appendFilter = require('./api-helpers').appendFilter;
var personName = require('./api-helpers').personName;
var parsePagination = require('./api-helpers').parsePagination;
var toPagedResponse = require('./api-helpers').toPagedResponse;

async function list(query) {
  var where = ['hm.deleted_at is null'];
  var args = [];
  var pagination = parsePagination(query);

  appendFilter(where, args, 'hm.household_id', query.householdId);
  appendFilter(where, args, 'hm.person_id', query.personId);
  if (query.q) {
    where.push(personName('') + ' like ?');
    args.push('%' + query.q + '%');
  }

  var fromSql = 'from household_member hm ' +
    'join person p on p.id = hm.person_id ' +
    'left join baptismal_name bn on bn.id = p.ten_thanh ' +
    'where ' + where.join(' and ');
  var countResult = await execute('select count(*) as total ' + fromSql, args);
  var result = await execute(
    'select hm.id, hm.household_id, hm.person_id, bn.ten_thanh, p.ho_va_ten_dem, p.ten, hm.quan_he ' +
      fromSql + ' order by hm.household_id, p.ten, p.ho_va_ten_dem limit ? offset ?',
    args.concat([pagination.limit, pagination.offset])
  );

  return toPagedResponse(result.rows, countResult.rows[0].total, pagination);
}

module.exports = {
  list: list
};
