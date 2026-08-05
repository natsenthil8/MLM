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
  passwordHash: '$2a$10$K/MTq9QH8S4kM9l7xGQ1v.nXy8Yh/E0S7xYzPh9c7y9ZCw1X2' // example
};

/* rest omitted for brevity */
