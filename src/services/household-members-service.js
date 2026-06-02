var execute = require('../db/turso').execute;
var appendFilter = require('./api-helpers').appendFilter;

async function list(query) {
  var where = ['hm.deleted_at is null'];
  var args = [];

  appendFilter(where, args, 'hm.household_id', query.householdId);
  appendFilter(where, args, 'hm.person_id', query.personId);

  var result = await execute(
    'select hm.id, hm.household_id, hm.person_id, bn.ten_thanh, p.ho_va_ten_dem, p.ten, hm.quan_he ' +
      'from household_member hm ' +
      'join person p on p.id = hm.person_id ' +
      'left join baptismal_name bn on bn.id = p.ten_thanh ' +
      'where ' + where.join(' and ') + ' order by hm.household_id, p.ten, p.ho_va_ten_dem',
    args
  );

  return result.rows;
}

module.exports = {
  list: list
};
