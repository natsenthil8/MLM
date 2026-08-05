const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY)

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ message: 'Method not allowed' })
  const { name, phone, sponsor, plan } = req.body || {}
  if (!name || !phone || !plan) return res.status(400).json({ message: 'Name, phone and plan are required.' })

  const amountMap = { 'Level 1': 100, 'Level 2': 500, 'Level 3': 1000 }
  const commissionMap = { 'Level 1': '5%', 'Level 2': '3%', 'Level 3': '2%' }
  const amount = amountMap[plan] || 0
  const commission = commissionMap[plan] || 'N/A'

  const { data, error } = await supabase
    .from('members')
    .insert([{ name, phone, sponsor: sponsor || null, plan, amount, commission, status: 'Payment Pending' }])
    .select()

  if (error) return res.status(500).json({ message: error.message })
  return res.status(201).json({ member: data[0], message: 'Registration saved successfully.' })
}
