const express = require('express');
const router = express.Router();
const users = require('../data/users.json');

// POST /api/auth/login - Mock login
router.post('/login', (req, res) => {
  const { email } = req.body;
  const user = users.find(u => u.email === email);

  if (!user) {
    return res.status(401).json({ error: 'משתמש לא נמצא' });
  }

  // Mock token
  res.json({
    token: `mock-jwt-token-${user.id}`,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  });
});

// POST /api/auth/register - Mock register
router.post('/register', (req, res) => {
  const { fullName, email } = req.body;

  if (!fullName || !email) {
    return res.status(400).json({ error: 'fullName and email are required' });
  }

  const existing = users.find(u => u.email === email);
  if (existing) {
    return res.status(409).json({ error: 'כתובת אימייל כבר קיימת במערכת' });
  }

  const newUser = {
    id: users.length + 1,
    fullName,
    email,
    role: 'user',
  };
  users.push(newUser);

  res.status(201).json({
    token: `mock-jwt-token-${newUser.id}`,
    user: {
      id: newUser.id,
      fullName: newUser.fullName,
      email: newUser.email,
      role: newUser.role,
    },
  });
});

module.exports = router;
