const { sendJson, supabaseRequest } = require('./_helpers');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return sendJson(res, 405, { error: 'Method not allowed' });

  const body = await new Promise((resolve) => {
    let buf = '';
    req.on('data', (c) => buf += c);
    req.on('end', () => {
      try { resolve(JSON.parse(buf || '{}')); } catch { resolve({}); }
    });
  });

  const required = ['name', 'phone', 'plan'];
  for (const k of required) if (!body[k]) return sendJson(res, 400, { error: `${k} is required` });

  const insert = {
    name: body.name,
    phone: body.phone,
    sponsor: body.sponsor || null,
    plan: body.plan,
    amount: body.amount || null,
    commission: body.commission || null,
    status: body.status || 'active'
  };

  const { status, data } = await supabaseRequest('POST', '/members', insert);
  if (status !== 201 && status !== 200) return sendJson(res, 500, { error: 'Failed to create member', detail: data });

  return sendJson(res, 201, { member: data });
};
