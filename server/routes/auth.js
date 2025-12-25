const express = require('express');
const jwt = require('jsonwebtoken');
const { loginSchema } = require('../utils/validation');

const router = express.Router();

// Hardcoded admin users
const ADMIN_USERS = {
  'Farhan': {
    password: 'Farhan8776',
    name: 'Farhan',
    id: 'admin_farhan'
  },
  'Sheerin': {
    password: 'Shafan', 
    name: 'Sheerin',
    id: 'admin_sheerin'
  }
};

// Login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = loginSchema.parse(req.body);

    const admin = ADMIN_USERS[username];
    if (!admin || admin.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: admin.id, username: username },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.cookie('authToken', token, {
      httpOnly: true,
      secure: true,
      sameSite: 'none',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      domain: '.onrender.com'
    });

    res.json({
      message: 'Login successful',
      admin: {
        id: admin.id,
        username: username,
        name: admin.name
      }
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Logout
router.post('/logout', (req, res) => {
  res.clearCookie('authToken');
  res.json({ message: 'Logout successful' });
});

// Check auth status
router.get('/me', (req, res) => {
  try {
    const token = req.cookies.authToken;
    
    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = ADMIN_USERS[decoded.username];
    
    if (!admin) {
      return res.status(401).json({ message: 'Invalid token' });
    }

    res.json({
      admin: {
        id: admin.id,
        username: decoded.username,
        name: admin.name
      }
    });
  } catch (error) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

module.exports = router;