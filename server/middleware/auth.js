const jwt = require('jsonwebtoken');

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

const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const admin = ADMIN_USERS[decoded.username];
    
    if (!admin) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    req.admin = {
      id: admin.id,
      username: decoded.username,
      name: admin.name
    };
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

module.exports = authMiddleware;