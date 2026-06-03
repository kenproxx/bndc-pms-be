var bcrypt = require('bcryptjs');
var createError = require('http-errors');
var ulid = require('ulid').ulid;
var config = require('../config');
var execute = require('../db/turso').execute;

function normalizeString(value) {
  return typeof value === 'string' ? value.trim() : '';
}

function toAccount(row) {
  return {
    id: row.id,
    username: row.username,
    addressId: row.address_id,
    createdBy: row.created_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function validateCreate(input) {
  if (!input || typeof input !== 'object') {
    throw createError(400, 'Request body is required');
  }

  var username = normalizeString(input.username);
  var password = typeof input.password === 'string' ? input.password : '';
  var addressId = normalizeString(input.addressId);
  var createdBy = normalizeString(input.createdBy);

  if (!username) {
    throw createError(400, 'username is required');
  }
  if (!password) {
    throw createError(400, 'password is required');
  }
  if (!addressId) {
    throw createError(400, 'addressId is required');
  }

  return {
    username: username,
    password: password,
    addressId: addressId,
    createdBy: createdBy || null
  };
}

async function assertAddressExists(addressId) {
  var result = await execute(
    'select id from address where id = ? and deleted_at is null limit 1',
    [addressId]
  );

  if (!result.rows[0]) {
    throw createError(400, 'addressId does not exist');
  }
}

function mapInsertError(error) {
  var message = error.message || 'Unable to create account';

  if (message.indexOf('UNIQUE') !== -1) {
    return createError(409, 'username already exists');
  }
  if (message.indexOf('FOREIGN KEY') !== -1) {
    return createError(400, 'addressId does not exist');
  }

  return createError(400, message);
}

async function create(input) {
  var account = validateCreate(input);
  var id = ulid();

  await assertAddressExists(account.addressId);

  try {
    var passwordHash = await bcrypt.hash(account.password, config.account.passwordSaltRounds);

    await execute(
      'insert into "user" (id, username, password_hash, address_id, created_by) values (?, ?, ?, ?, ?)',
      [id, account.username, passwordHash, account.addressId, account.createdBy]
    );
  } catch (error) {
    throw mapInsertError(error);
  }

  var result = await execute(
    'select id, username, address_id, created_by, created_at, updated_at from "user" where id = ? limit 1',
    [id]
  );

  return toAccount(result.rows[0]);
}

module.exports = {
  create: create
};
