const jwt = require('jsonwebtoken')

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })
  const { username, password } = req.body || {}
  if (!username || !password) return res.status(400).json({ message: 'Missing credentials' })
  if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ role: 'member', user: username }, process.env.JWT_SECRET, { expiresIn: '8h' })
    return res.json({ token })
  }
  return res.status(401).json({ message: 'Invalid member credentials.' })
}
