const { createClient } = require('@supabase/supabase-js')
const jwt = require('jsonwebtoken')

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })
  const { username, password } = req.body || {}
  if (!username || !password) return res.status(400).json({ message: 'Missing credentials' })

  if (username !== process.env.ADMIN_USERNAME || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const token = jwt.sign({ role: 'admin', user: username }, process.env.JWT_SECRET, { expiresIn: '8h' })
  return res.json({ token })
}
