const jwt = require('jsonwebtoken')

module.exports = async (req, res) => {
  // Serverless logout is stateless; client should clear tokens.
  return res.json({ ok: true, message: 'Logout (noop on server). Clear token on client.' })
}
