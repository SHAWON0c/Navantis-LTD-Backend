const express = require('express');
const router = express.Router();

// Import each function from its file
const { register } = require('../controllers/auth/register.controller');
const { verifyOTP } = require('../controllers/auth/verifyOtp.controller');
const { login } = require('../controllers/auth/login.controller');
const { resendOTP } = require('../controllers/auth/resendOtp.controller');
// const AuthMiddleware = require('../middlewares/Authmiddleware');
const { getMe } = require('../controllers/auth/me.controller');

// Routes
router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/resend-otp', resendOTP);
router.get("/me", getMe );


module.exports = router;
