const jwt = require('jsonwebtoken')
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

function getTokenFromHeader(req) {
  const auth = req.headers && (req.headers.authorization || req.headers.Authorization)
  if (!auth) return null
  const parts = auth.split(' ')
  if (parts.length === 2 && parts[0] === 'Bearer') return parts[1]
  return null
}

module.exports = async (req, res) => {
  if (req.method !== 'GET') return res.status(405).json({ message: 'Method not allowed' })
  const token = getTokenFromHeader(req)
  if (!token) return res.status(401).json({ message: 'Missing token' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    if (decoded.role !== 'admin') return res.status(403).json({ message: 'Admin access required' })
  } catch (err) {
    return res.status(401).json({ message: 'Invalid token' })
  }

  const { data, error } = await supabase.from('members').select('plan, amount')
  if (error) return res.status(500).json({ message: error.message })

  const totalMembers = (await supabase.from('members').select('id')).data.length
  const totalAmount = data.reduce((s, r) => s + (r.amount || 0), 0)
  const commissions = {
    '5%': (await supabase.from('members').select('id').eq('plan', 'Level 1')).data.length,
    '3%': (await supabase.from('members').select('id').eq('plan', 'Level 2')).data.length,
    '2%': (await supabase.from('members').select('id').eq('plan', 'Level 3')).data.length
  }

  return res.json({ totalMembers, totalAmount, commissions })
}
