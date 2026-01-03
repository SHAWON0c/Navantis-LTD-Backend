// controllers/auth/register.js
const User = require('../../models/User');
const generateOTP = require('../../utils/generateOTP');
const transporter = require('../../config/mailer');
const OTPModel = require('../../models/Otp');

exports.register = async (req, res) => {
  const { email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ message: 'User already exists' });

    const user = new User({ email, password });
    await user.save();

    const otp = generateOTP();
    const otpEntry = new OTPModel({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });
    await otpEntry.save();

    // Optional: comment out for now
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is ${otp}. It will expire in 10 minutes.`
    });

    console.log(`OTP for ${email}: ${otp}`); // useful for testing

    res.status(201).json({ message: 'User registered, OTP saved' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
