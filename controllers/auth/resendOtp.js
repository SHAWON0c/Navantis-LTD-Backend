// controllers/auth/resendOtp.js
const User = require('../../models/User');
const OTPModel = require('../../models/Otp');
const generateOTP = require('../../utils/generateOTP');
const transporter = require('../../config/mailer');

exports.resendOTP = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'User already verified' });

    // Generate a new OTP
    const otp = generateOTP();

    // Delete old OTPs
    await OTPModel.deleteMany({ email });

    // Save the new OTP
    const otpEntry = new OTPModel({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
    });
    await otpEntry.save();

    // Optional: send email (commented for now)
 
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your new OTP is ${otp}. It will expire in 10 minutes.`
    });
   

    // Log OTP for testing
    console.log(`Resent OTP for ${email}: ${otp}`);

    res.json({ message: 'OTP resent successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
