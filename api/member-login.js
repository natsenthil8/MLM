const { sendJson, supabaseRequest, jwt } = require('./_helpers');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  const body = await new Promise((resolve) => {
    let buf = '';
    req.on('data', (c) => buf += c);
    req.on('end', () => {
      try { resolve(JSON.parse(buf || '{}')); } catch { resolve({}); }
    });
  });

  const phone = body.phone;
  if (!phone) return sendJson(res, 400, { error: 'phone is required' });

  // look up member by phone
  const { status, data } = await supabaseRequest('GET', `/members?phone=eq.${encodeURIComponent(phone)}&select=*`);
  if (status !== 200 || !Array.isArray(data) || data.length === 0) return sendJson(res, 401, { error: 'Member not found' });

  const member = data[0];
  const token = jwt.sign({ role: 'member', memberId: member.id }, process.env.JWT_SECRET, { expiresIn: '8h' });

  return sendJson(res, 200, { token, member });
};
