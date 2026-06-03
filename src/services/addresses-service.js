var createError = require('http-errors');
var execute = require('../db/turso').execute;
var appendFilter = require('./api-helpers').appendFilter;
var makeId = require('./api-helpers').makeId;
var parsePagination = require('./api-helpers').parsePagination;
var toPagedResponse = require('./api-helpers').toPagedResponse;

async function list(query) {
  var where = ['a.deleted_at is null'];
  var args = [];
  var pagination = parsePagination(query);

  appendFilter(where, args, 'a.id_parent', query.parentId);
  appendFilter(where, args, 'a.cap_bac', query.cap_bac);
  appendFilter(where, args, 'a.ten_dia_danh', query.tenDiaDanh);
  if (query.q) {
    where.push('(a.ten_dia_danh like ? or a.code like ?)');
    args.push('%' + query.q + '%', '%' + query.q + '%');
  }

  var countResult = await execute(
    'select count(*) as total from address a where ' + where.join(' and '),
    args
  );
  var result = await execute(
    'select a.* from address a where ' + where.join(' and ') + ' order by a.cap_bac, a.ten_dia_danh limit ? offset ?',
    args.concat([pagination.limit, pagination.offset])
  );

  return toPagedResponse(result.rows, countResult.rows[0].total, pagination);
}

function validateAddressInput(input) {
  if (!input || typeof input !== 'object') {
    throw createError(400, 'Request body is required');
  }

  var id = input.id;
  var capBac = input.capBac;
  var tenDiaDanh = input.tenDiaDanh;
  var idParent = input.idParent;
  var tenVietTat = input.tenVietTat;

  if (id !== undefined && id !== null && (typeof id !== 'string' || id.trim() === '')) {
    throw createError(400, 'id must be a non-empty string');
  }

  if (typeof capBac === 'string' && capBac.trim() !== '') {
    capBac = Number(capBac);
  }
  if (!Number.isInteger(capBac) || capBac < 1 || capBac > 5) {
    throw createError(400, 'capBac must be an integer between 1 and 5');
  }

  if (!tenDiaDanh || typeof tenDiaDanh !== 'string' || tenDiaDanh.trim() === '') {
    throw createError(400, 'tenDiaDanh is required');
  }

  if (!tenVietTat || typeof tenVietTat !== 'string' || tenVietTat.trim().length !== 2) {
    throw createError(400, 'tenVietTat is required and must be exactly 2 characters');
  }

  return {
    id: id ? id.trim() : null,
    capBac: capBac,
    tenDiaDanh: tenDiaDanh.trim(),
    idParent: idParent || null,
    tenVietTat: tenVietTat.trim()
  };
}

async function assertNoDuplicateName(address, excludeId) {
  var args = [address.tenDiaDanh, address.idParent, address.idParent];
  var excludeCondition = '';
  if (excludeId) {
    excludeCondition = ' and id <> ?';
    args.push(excludeId);
  }

  var result = await execute(
    'select id from address where deleted_at is null and ten_dia_danh = ? and (id_parent = ? or (id_parent is null and ? is null))' + excludeCondition + ' limit 1',
    args
  );
  if (result.rows.length > 0) {
    throw createError(409, 'tenDiaDanh already exists for this idParent');
  }
}

async function insertAddress(address) {
  var id = address.id || makeId();
  try {
    await execute(
      'insert into address (id, cap_bac, ten_dia_danh, id_parent, code) values (?, ?, ?, ?, ?)',
      [id, address.capBac, address.tenDiaDanh, address.idParent, address.tenVietTat]
    );
  } catch (error) {
    throw createError(error.message && error.message.indexOf('UNIQUE') !== -1 ? 409 : 400, error.message || 'Unable to create address');
  }

  var result = await execute('select * from address where id = ? limit 1', [id]);
  return result.rows[0];
}

async function updateAddress(id, address) {
  try {
    await execute(
      'update address set cap_bac = ?, ten_dia_danh = ?, id_parent = ?, code = ? where id = ? and deleted_at is null',
      [address.capBac, address.tenDiaDanh, address.idParent, address.tenVietTat, id]
    );
  } catch (error) {
    throw createError(error.message && error.message.indexOf('UNIQUE') !== -1 ? 409 : 400, error.message || 'Unable to update address');
  }

  var result = await execute('select * from address where id = ? limit 1', [id]);
  return result.rows[0];
}

async function create(input) {
  var address = validateAddressInput(input);
  await assertNoDuplicateName(address);
  return insertAddress(address);
}

async function save(input) {
  var address = validateAddressInput(input);
  var existsResult = address.id
    ? await execute('select id from address where id = ? and deleted_at is null limit 1', [address.id])
    : { rows: [] };

  if (existsResult.rows.length > 0) {
    await assertNoDuplicateName(address, address.id);
    return {
      created: false,
      item: await updateAddress(address.id, address)
    };
  }

  await assertNoDuplicateName(address);
  return {
    created: true,
    item: await insertAddress(address)
  };
}

module.exports = {
  list: list,
  create: create,
  save: save
};
