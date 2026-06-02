function getBearerToken(req) {
  var authorization = req.get('authorization') || '';
  var match = authorization.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

module.exports = {
  getBearerToken: getBearerToken
};
