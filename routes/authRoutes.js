const express = require('express');
const router = express.Router();

// Import each function from its file
const { register } = require('../controllers/auth/register');
const { verifyOTP } = require('../controllers/auth/verifyOtp');
const { login } = require('../controllers/auth/login');
const { resendOTP } = require('../controllers/auth/resendOtp');

// Routes
router.post('/register', register);
router.post('/verify-otp', verifyOTP);
router.post('/login', login);
router.post('/resend-otp', resendOTP);


module.exports = router;
