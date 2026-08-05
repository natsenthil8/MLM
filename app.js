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

/* rest omitted for brevity in this push content */
