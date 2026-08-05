const { sendJson, supabaseRequest, verifyAdminTokenFromHeader } = require('./_helpers');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  const admin = verifyAdminTokenFromHeader(req);
  if (!admin) return sendJson(res, 401, { error: 'Unauthorized' });

  // fetch all members and compute basic aggregates
  const { status, data } = await supabaseRequest('GET', '/members?select=*');
  if (status !== 200) return sendJson(res, 500, { error: 'Failed to fetch members', detail: data });

  const count = Array.isArray(data) ? data.length : 0;
  const totalAmount = (Array.isArray(data) ? data : []).reduce((s, m) => s + (Number(m.amount) || 0), 0);

  return sendJson(res, 200, { count, totalAmount });
};
