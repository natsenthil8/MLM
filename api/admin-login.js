const crypto = require('crypto')

module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })

    // Basic content-type guard
    if (req.headers && req.headers['content-type'] && !req.headers['content-type'].includes('application/json')) {
      // still attempt to parse body, but warn
      console.warn('admin-login: unexpected content-type', req.headers['content-type'])
    }

    const { username, password } = req.body || {}
    if (!username || !password) return res.status(400).json({ message: 'Missing credentials' })

    // Required env checks
    const {
      ADMIN_USERNAME,
      ADMIN_PASSWORD,
      JWT_SECRET,
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY,
    } = process.env

    if (!ADMIN_USERNAME || !ADMIN_PASSWORD || !JWT_SECRET) {
      console.error('Missing ADMIN_USERNAME, ADMIN_PASSWORD or JWT_SECRET env var')
      return res.status(500).json({ message: 'Server not configured' })
    }

    // Optional: ensure supabase envs set if you plan to use it server-side
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      console.warn('Supabase env not set — Supabase client will not be available')
    }

    // Safe, constant-time comparison to mitigate timing attacks
    const safeCompare = (a, b) => {
      try {
        const bufA = Buffer.from(String(a))
        const bufB = Buffer.from(String(b))
        if (bufA.length !== bufB.length) return false
        return crypto.timingSafeEqual(bufA, bufB)
      } catch (e) {
        return false
      }
    }

    if (!safeCompare(username, ADMIN_USERNAME) || !safeCompare(password, ADMIN_PASSWORD)) {
      // Do not reveal which field was wrong
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const jwt = require('jsonwebtoken')

    // Basic JWT_SECRET length check to catch misconfiguration early
    if (String(JWT_SECRET).length < 8) {
      console.error('JWT_SECRET is too short — use a stronger secret')
      return res.status(500).json({ message: 'Server not configured' })
    }

    const token = jwt.sign({ role: 'admin', user: username }, JWT_SECRET, { expiresIn: '8h' })

    // Return token (do not leak any sensitive info)
    return res.json({ token })
  } catch (err) {
    console.error('admin-login error:', err && err.stack ? err.stack : err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
