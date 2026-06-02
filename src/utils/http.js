function sendOk(res, data, statusCode) {
  res.status(statusCode || 200).json(Object.assign({ ok: true }, data || {}));
}

module.exports = {
  sendOk: sendOk
};
