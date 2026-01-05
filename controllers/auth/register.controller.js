// controllers/auth/register.js
const User = require('../../models/User.model');
const generateOTP = require('../../utils/generateOTP');
const transporter = require('../../config/mailer');
const OTPModel = require('../../models/Otp.model');

exports.register = async (req, res) => {
  const { email, password, role } = req.body; // <-- include role from request

  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) 
      return res.status(400).json({ message: 'User already exists' });

    // Validate role
    const allowedRoles = ['user', 'admin', 'superadmin'];
    const userRole = allowedRoles.includes(role) ? role : 'user';

    // Create new user
    const user = new User({ email, password, role: userRole });
    await user.save();

    // Generate OTP
    const otp = generateOTP();
    const otpEntry = new OTPModel({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });
    await otpEntry.save();

    // Optional: send OTP email (commented out if testing)
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is ${otp}. It will expire in 10 minutes.`
    });

    console.log(`OTP for ${email}: ${otp}`); // for testing

    res.status(201).json({ 
      message: `User registered with role '${userRole}', OTP saved`,
      role: userRole
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


