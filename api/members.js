const { sendJson, supabaseRequest, verifyAdminTokenFromHeader } = require('./_helpers');

module.exports = async (req, res) => {
  if (req.method !== 'GET') return sendJson(res, 405, { error: 'Method not allowed' });

  const admin = verifyAdminTokenFromHeader(req);
  if (!admin) return sendJson(res, 401, { error: 'Unauthorized' });

  const { status, data } = await supabaseRequest('GET', '/members?select=*');
  if (status !== 200) return sendJson(res, 500, { error: 'Failed to fetch members', detail: data });

  return sendJson(res, 200, { members: data });
};
