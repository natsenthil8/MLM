const { sendJson } = require('./_helpers');

module.exports = async (req, res) => {
  // For serverless-based logout, client should simply delete the token.
  // This endpoint exists for parity with previous servers and always returns success.
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });
  return sendJson(res, 200, { ok: true });
};
