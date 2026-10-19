const express = require('express');
const {
  register,
  login,
  getMe,
  logout,
  updateMe,
  changePassword,
} = require('../controllers/authController');
const {
  validateRegister,
  validateLogin,
  validateUpdateMe,
  validateChangePassword,
} = require('../validators/authValidator');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected routes (require valid JWT)
router.use(protect);

router.get('/me', getMe);
router.post('/logout', logout);
router.patch('/me', validateUpdateMe, updateMe);
router.patch('/password', validateChangePassword, changePassword);

module.exports = router;
