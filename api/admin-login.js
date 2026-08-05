module.exports = async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })

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

    if (username !== ADMIN_USERNAME || password !== ADMIN_PASSWORD) {
      return res.status(401).json({ message: 'Invalid credentials' })
    }

    const jwt = require('jsonwebtoken')
    const token = jwt.sign({ role: 'admin', user: username }, JWT_SECRET, { expiresIn: '8h' })

    return res.json({ token })
  } catch (err) {
    console.error('admin-login error:', err && err.stack ? err.stack : err)
    return res.status(500).json({ message: 'Internal server error' })
  }
}
