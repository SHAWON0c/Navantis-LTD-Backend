// controllers/auth/verifyOtp.js
const User = require('../../models/User.model');
const OTPModel = require('../../models/Otp.model');
const jwt = require('jsonwebtoken');

exports.verifyOTP = async (req, res) => {
  const { email, otp } = req.body;

  try {
    const otpRecord = await OTPModel.findOne({ email, otp });
    if (!otpRecord) return res.status(400).json({ message: 'Invalid OTP' });
    if (otpRecord.expiresAt < new Date()) return res.status(400).json({ message: 'OTP expired' });

    await User.findOneAndUpdate({ email }, { isVerified: true });
    await OTPModel.deleteMany({ email }); // remove used OTPs

    const token = jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '1h' });

    res.json({ message: 'Verified successfully', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
