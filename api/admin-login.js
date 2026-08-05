const { sendJson, jwt } = require('./_helpers');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  const body = await new Promise((resolve) => {
    let buf = '';
    req.on('data', (c) => buf += c);
    req.on('end', () => {
      try { resolve(JSON.parse(buf || '{}')); } catch { resolve({}); }
    });
  });

  const username = process.env.ADMIN_USERNAME || 'admin';
  const password = process.env.ADMIN_PASSWORD;

  if (!password) return sendJson(res, 500, { error: 'ADMIN_PASSWORD not configured on server' });

  if (body.username !== username || body.password !== password) {
    return sendJson(res, 401, { error: 'Invalid credentials' });
  }

  const token = jwt.sign({ role: 'admin' }, process.env.JWT_SECRET, { expiresIn: '8h' });
  return sendJson(res, 200, { token });
};
