function getBearerToken(req) {
  var authorization = req.get('authorization') || '';
  var match = authorization.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : '';
}

function getCookieToken(req, cookieName) {
  if (!req.cookies || !cookieName) return '';
  return req.cookies[cookieName] || '';
}

module.exports = {
  getBearerToken: getBearerToken,
  getCookieToken: getCookieToken
};
