/* Updated app.js for Vercel serverless backend (stores admin token and sends Authorization header) */
const storageKey = 'mlmMembers';

function apiHeaders(includeJson = true) {
  const headers = {}
  const token = sessionStorage.getItem('adminToken')
  if (includeJson) headers['Content-Type'] = 'application/json'
  if (token) headers['Authorization'] = 'Bearer ' + token
  return headers
}

const planDetails = {
  'Level 1': { amount: 100, commission: '5%' },
  'Level 2': { amount: 500, commission: '3%' },
  'Level 3': { amount: 1000, commission: '2%' }
}

function saveMembers(members) {
  localStorage.setItem(storageKey, JSON.stringify(members))
}

function getMembers() {
  const data = localStorage.getItem(storageKey)
  return data ? JSON.parse(data) : []
}

async function fetchMembers() {
  try {
    const res = await fetch('/api/members', { headers: apiHeaders() })
    if (!res.ok) throw new Error('Failed to load members')
    return await res.json()
  } catch (e) {
    return getMembers()
  }
}

async function fetchSummary() {
  try {
    const res = await fetch('/api/summary', { headers: apiHeaders() })
    if (!res.ok) throw new Error('Failed to load summary')
    return await res.json()
  } catch (e) {
    return null
  }
}

function renderRows(members = []) {
  const rows = document.getElementById('memberRows')
  if (!rows) return

  if (!members.length) {
    rows.innerHTML = '<tr><td colspan="5">No registrations found.</td></tr>'
    return
  }

  rows.innerHTML = members.map((member) => {
    const commission = planDetails[member.plan]?.commission || member.commission || 'N/A'
    return `
      <tr>
        <td>${member.name}</td>
        <td>${member.phone}</td>
        <td>${member.sponsor || 'N/A'}</td>
        <td>${member.plan} (${commission})</td>
        <td>${member.status || 'Pending'}</td>
      </tr>
    `
  }).join('')
}

function renderSummary(summary) {
  const summaryBox = document.getElementById('adminSummary')
  if (!summaryBox || !summary) return

  summaryBox.innerHTML = `
    <div class="summary-item">
      <strong>Total Members</strong>
      <p>${summary.totalMembers || 0}</p>
    </div>
    <div class="summary-item">
      <strong>Total Amount</strong>
      <p>₹${summary.totalAmount || 0}</p>
    </div>
    <div class="summary-item">
      <strong>Commission Breakdown</strong>
      <p>5%: ${summary.commissions?.['5%'] || 0} | 3%: ${summary.commissions?.['3%'] || 0} | 2%: ${summary.commissions?.['2%'] || 0}</p>
    </div>
  `
}

async function routeAdmin() {
  const adminLoginSection = document.getElementById('adminLogin')
  const adminPanel = document.getElementById('adminPanel')
  const token = sessionStorage.getItem('adminToken')
  const isLoggedIn = token != null

  if (adminLoginSection && adminPanel) {
    if (isLoggedIn) {
      adminLoginSection.classList.add('hidden')
      adminPanel.classList.remove('hidden')
      const [members, summary] = await Promise.all([fetchMembers(), fetchSummary()])
      renderRows(members)
      renderSummary(summary)
    } else {
      adminLoginSection.classList.remove('hidden')
      adminPanel.classList.add('hidden')
    }
  }
}

function updatePaymentAmount(plan) {
  const payButton = document.getElementById('upiPayButton')
  if (!payButton) return

  const amount = planDetails[plan]?.amount || 100
  try {
    const url = new URL(payButton.href)
    url.searchParams.set('am', amount)
    payButton.href = url.toString()
  } catch (e) {
    // non-http scheme (upi://) — rebuild basic href
    const base = 'upi://pay?pa=9025591088@upi&pn=MLM%20Scheme&cu=INR&tn=MLM%20Enrollment'
    payButton.href = `${base}&am=${amount}`
  }
}

function handleJoinForm() {
  const form = document.getElementById('joinForm')
  const status = document.getElementById('statusMessage')
  const planSelect = document.getElementById('planSelect')
  if (!form || !status || !planSelect) return

  updatePaymentAmount(planSelect.value)
  planSelect.addEventListener('change', (event) => {
    updatePaymentAmount(event.target.value)
  })

  form.addEventListener('submit', async (event) => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(form).entries())

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Registration failed')

      const members = getMembers()
      members.push({ ...result.member })
      saveMembers(members)

      status.textContent = `Registered successfully for ${data.plan}. Please complete UPI payment using 9025591088@upi.`
      form.reset()
      updatePaymentAmount(planSelect.value)
    } catch (error) {
      status.textContent = error.message || 'Registration failed. Please try again.'
    }
  })
}

function handleLoginForm() {
  const loginForm = document.getElementById('loginForm')
  const loginMessage = document.getElementById('loginMessage')
  if (!loginForm || !loginMessage) return

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(loginForm).entries())

    try {
      const response = await fetch('/api/member-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Invalid member credentials.')

      loginMessage.textContent = 'Member login successful. Redirecting to registration...'
      // store member token if needed
      sessionStorage.setItem('memberToken', result.token)
      window.location.href = 'registration.html'
    } catch (error) {
      loginMessage.textContent = error.message || 'Invalid member credentials.'
    }
  })
}

function handleAdminForm() {
  const adminForm = document.getElementById('adminForm')
  const adminError = document.getElementById('adminError')
  if (!adminForm || !adminError) return

  adminForm.addEventListener('submit', async (event) => {
    event.preventDefault()
    const data = Object.fromEntries(new FormData(adminForm).entries())

    try {
      const response = await fetch('/api/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      const result = await response.json()
      if (!response.ok) throw new Error(result.message || 'Invalid admin credentials.')

      sessionStorage.setItem('adminToken', result.token)
      sessionStorage.setItem('adminLoggedIn', 'true')
      adminError.textContent = ''
      adminForm.reset()
      routeAdmin()
    } catch (error) {
      adminError.textContent = error.message || 'Invalid admin credentials.'
    }
  })
}

function handleLogout() {
  const logoutBtn = document.getElementById('logoutBtn')
  if (!logoutBtn) return

  logoutBtn.addEventListener('click', async () => {
    await fetch('/api/logout', { method: 'POST' })
    sessionStorage.removeItem('adminLoggedIn')
    sessionStorage.removeItem('adminToken')
    routeAdmin()
  })
}

window.addEventListener('DOMContentLoaded', () => {
  handleJoinForm()
  handleLoginForm()
  handleAdminForm()
  handleLogout()
  routeAdmin()
})
