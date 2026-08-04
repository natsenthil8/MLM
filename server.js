const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = path.join(__dirname, 'data.json');

const planDetails = {
  'Level 1': { amount: 100, commission: '5%' },
  'Level 2': { amount: 500, commission: '3%' },
  'Level 3': { amount: 1000, commission: '2%' }
};

const adminUser = {
  username: 'admin',
  passwordHash: bcrypt.hashSync('admin123', 10)
};

const memberUser = {
  username: 'member',
  passwordHash: bcrypt.hashSync('member123', 10)
};

app.use(express.json());
app.use(session({
  secret: 'mlm-demo-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 60 * 60 * 1000 }
}));
app.use(express.static(__dirname));

function ensureDataFile() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify([], null, 2));
  }
}

function readMembers() {
  ensureDataFile();
  return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
}

function writeMembers(members) {
  ensureDataFile();
  fs.writeFileSync(DATA_FILE, JSON.stringify(members, null, 2));
}

function isAdmin(req) {
  return req.session && req.session.role === 'admin';
}

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.post('/api/register', (req, res) => {
  const { name, phone, sponsor, plan } = req.body;

  if (!name || !phone || !plan) {
    return res.status(400).json({ message: 'Name, phone and plan are required.' });
  }

  const members = readMembers();
  const member = {
    name,
    phone,
    sponsor: sponsor || 'N/A',
    plan,
    amount: planDetails[plan]?.amount || 0,
    commission: planDetails[plan]?.commission || 'N/A',
    status: 'Payment Pending',
    createdAt: new Date().toISOString()
  };

  members.push(member);
  writeMembers(members);

  return res.status(201).json({ message: 'Registration saved successfully.', member });
});

app.get('/api/members', (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).json({ message: 'Admin access required.' });
  }

  return res.json(readMembers());
});

app.post('/api/admin/login', (req, res) => {
  const { username, password } = req.body;

  if (username === adminUser.username && bcrypt.compareSync(password, adminUser.passwordHash)) {
    req.session.role = 'admin';
    req.session.username = username;
    return res.json({ ok: true, message: 'Admin login successful.' });
  }

  return res.status(401).json({ ok: false, message: 'Invalid admin credentials.' });
});

app.post('/api/member/login', (req, res) => {
  const { username, password } = req.body;

  if (username === memberUser.username && bcrypt.compareSync(password, memberUser.passwordHash)) {
    req.session.role = 'member';
    req.session.username = username;
    return res.json({ ok: true, message: 'Member login successful.' });
  }

  return res.status(401).json({ ok: false, message: 'Invalid member credentials.' });
});

app.post('/api/logout', (req, res) => {
  req.session.destroy(() => {
    res.json({ ok: true, message: 'Logged out.' });
  });
});

app.get('/api/summary', (req, res) => {
  if (!isAdmin(req)) {
    return res.status(403).json({ message: 'Admin access required.' });
  }

  const members = readMembers();
  const summary = {
    totalMembers: members.length,
    totalAmount: members.reduce((sum, member) => sum + (member.amount || 0), 0),
    commissions: {
      '5%': members.filter((member) => member.plan === 'Level 1').length,
      '3%': members.filter((member) => member.plan === 'Level 2').length,
      '2%': members.filter((member) => member.plan === 'Level 3').length
    }
  };

  return res.json(summary);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`MLM backend running on http://localhost:${PORT}`);
});
