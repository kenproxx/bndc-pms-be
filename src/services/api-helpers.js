var crypto = require('crypto');

function makeId() {
  return crypto.randomBytes(16).toString('base64url').slice(0, 26);
}

function appendFilter(where, args, column, value) {
  if (value !== undefined && value !== null && value !== '') {
    where.push(column + ' = ?');
    args.push(value);
  }
}

function personName(alias) {
  return "trim(coalesce(" + alias + "bn.ten_thanh || ' ', '') || coalesce(" + alias + "p.ho_va_ten_dem || ' ', '') || coalesce(" + alias + "p.ten, ''))";
}

module.exports = {
  makeId: makeId,
  appendFilter: appendFilter,
  personName: personName
};
