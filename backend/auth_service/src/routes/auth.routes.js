const express = require('express');
const { signup, login, logout } = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

const router = express.Router();

// POST /api/auth/signup - Register a new user
router.post('/signup', signup);

// POST /api/auth/login - Login user
router.post('/login', login);

// POST /api/auth/logout - Logout user (requires authentication)
router.post('/logout', authenticateToken, logout);

// GET /api/auth/me - Get current user (protected route example)
router.get('/me', authenticateToken, (req, res) => {
  res.json({
    user: {
      userId: req.user.userId,
      email: req.user.email
    }
  });
});

module.exports = router;
