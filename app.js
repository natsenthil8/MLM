const storageKey = 'mlmMembers';
const adminUser = { username: 'admin', password: 'admin123' };
const planDetails = {
  'Level 1': { amount: 100, commission: '5%' },
  'Level 2': { amount: 500, commission: '3%' },
  'Level 3': { amount: 1000, commission: '2%' }
};

function saveMembers(members) {
  localStorage.setItem(storageKey, JSON.stringify(members));
}

function getMembers() {
  const data = localStorage.getItem(storageKey);
  return data ? JSON.parse(data) : [];
}

function renderRows() {
  const rows = document.getElementById('memberRows');
  if (!rows) return;

  const members = getMembers();
  if (!members.length) {
    rows.innerHTML = '<tr><td colspan="5">No registrations found.</td></tr>';
    return;
  }

  rows.innerHTML = members.map((member) => {
    const commission = planDetails[member.plan]?.commission || 'N/A';
    return `
      <tr>
        <td>${member.name}</td>
        <td>${member.phone}</td>
        <td>${member.sponsor || 'N/A'}</td>
        <td>${member.plan} (${commission})</td>
        <td>${member.status || 'Pending'}</td>
      </tr>
    `;
  }).join('');
}

function routeAdmin() {
  const adminLoginSection = document.getElementById('adminLogin');
  const adminPanel = document.getElementById('adminPanel');
  const isLoggedIn = sessionStorage.getItem('adminLoggedIn') === 'true';

  if (adminLoginSection && adminPanel) {
    if (isLoggedIn) {
      adminLoginSection.classList.add('hidden');
      adminPanel.classList.remove('hidden');
      renderRows();
    } else {
      adminLoginSection.classList.remove('hidden');
      adminPanel.classList.add('hidden');
    }
  }
}

function updatePaymentAmount(plan) {
  const payButton = document.getElementById('upiPayButton');
  if (!payButton) return;

  const amount = planDetails[plan]?.amount || 100;
  const url = new URL(payButton.href);
  url.searchParams.set('am', amount);
  payButton.href = url.toString();
}

function handleJoinForm() {
  const form = document.getElementById('joinForm');
  const status = document.getElementById('statusMessage');
  const planSelect = document.getElementById('planSelect');
  if (!form || !status || !planSelect) return;

  updatePaymentAmount(planSelect.value);
  planSelect.addEventListener('change', (event) => {
    updatePaymentAmount(event.target.value);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const members = getMembers();
    members.push({
      ...data,
      amount: planDetails[data.plan]?.amount || 0,
      commission: planDetails[data.plan]?.commission || 'N/A',
      status: 'Payment Pending',
      createdAt: new Date().toISOString()
    });
    saveMembers(members);
    status.textContent = `Registered successfully for ${data.plan}. Please complete UPI payment using 9025591088@upi.`;
    form.reset();
    updatePaymentAmount(planSelect.value);
  });
}

function handleLoginForm() {
  const loginForm = document.getElementById('loginForm');
  const loginMessage = document.getElementById('loginMessage');
  if (!loginForm || !loginMessage) return;

  loginForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(loginForm).entries());
    if (data.username === 'member' && data.password === 'member123') {
      loginMessage.textContent = 'Member login successful. Redirecting to registration...';
      window.location.href = 'registration.html';
    } else {
      loginMessage.textContent = 'Invalid member credentials.';
    }
  });
}

function handleAdminForm() {
  const adminForm = document.getElementById('adminForm');
  const adminError = document.getElementById('adminError');
  if (!adminForm || !adminError) return;

  adminForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = Object.fromEntries(new FormData(adminForm).entries());
    if (data.username === adminUser.username && data.password === adminUser.password) {
      sessionStorage.setItem('adminLoggedIn', 'true');
      routeAdmin();
      adminError.textContent = '';
      adminForm.reset();
    } else {
      adminError.textContent = 'Invalid admin credentials.';
    }
  });
}

function handleLogout() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (!logoutBtn) return;

  logoutBtn.addEventListener('click', () => {
    sessionStorage.removeItem('adminLoggedIn');
    routeAdmin();
  });
}

window.addEventListener('DOMContentLoaded', () => {
  handleJoinForm();
  handleLoginForm();
  handleAdminForm();
  handleLogout();
  routeAdmin();
});
