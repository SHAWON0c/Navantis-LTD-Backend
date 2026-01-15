// // controllers/auth/register.js
// const User = require('../../models/User.model');
// const generateOTP = require('../../utils/generateOTP');
// const transporter = require('../../config/mailer');
// const OTPModel = require('../../models/Otp.model');

// exports.register = async (req, res) => {
//   const { email, password, role } = req.body; // <-- include role from request

//   try {
//     // Check if user already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) 
//       return res.status(400).json({ message: 'User already exists' });

//     // Validate role
//     const allowedRoles = ['user', 'admin', 'superadmin'];
//     const userRole = allowedRoles.includes(role) ? role : 'user';

//     // Create new user
//     const user = new User({ email, password, role: userRole });
//     await user.save();

//     // Generate OTP
//     const otp = generateOTP();
//     const otpEntry = new OTPModel({
//       email,
//       otp,
//       expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
//     });
//     await otpEntry.save();

//     // Optional: send OTP email (commented out if testing)
//     await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: 'Your OTP Code',
//       text: `Your OTP is ${otp}. It will expire in 10 minutes.`
//     });

//     console.log(`OTP for ${email}: ${otp}`); // for testing

//     res.status(201).json({ 
//       message: `User registered with role '${userRole}', OTP saved`,
//       role: userRole
//     });

//   } catch (err) {
//     console.error('Register error:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };




// controllers/auth/register.js
const User = require('../../models/User.model');
const generateOTP = require('../../utils/generateOTP');
const transporter = require('../../config/mailer');
const OTPModel = require('../../models/Otp.model');

exports.register = async (req, res) => {
  const { employeeId, email, password } = req.body;

  try {
    /* ===============================
       1️⃣ VALIDATION
    ================================ */
    if (!employeeId || !email || !password) {
      return res.status(400).json({
        message: 'Employee ID, email and password are required'
      });
    }

    /* ===============================
       2️⃣ CHECK EXISTING USER
    ================================ */
    const existingUser = await User.findOne({
      $or: [{ email }, { employeeId }]
    });

    if (existingUser) {
      return res.status(400).json({
        message: 'User already exists'
      });
    }

    /* ===============================
       3️⃣ FORCE SAFE ROLE
       (Public register = user only)
    ================================ */
    const userRole = 'user';

    /* ===============================
       4️⃣ CREATE USER
    ================================ */
    const user = new User({
      employeeId,
      email,
      password,
      role: userRole,
      isVerified: false
    });

    await user.save();

    /* ===============================
       5️⃣ GENERATE OTP
    ================================ */
    const otp = generateOTP();

    await OTPModel.create({
      email,
      otp,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000) // 10 min
    });

    /* ===============================
       6️⃣ SEND OTP EMAIL
    ================================ */
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: 'Your OTP Code',
      text: `Your OTP is ${otp}. It will expire in 10 minutes.`
    });

    console.log(`OTP for ${email}: ${otp}`); // dev only

    res.status(201).json({
      message: 'User registered successfully. Please verify OTP.',
      employeeId,
      role: userRole
    });

  } catch (err) {
    console.error('Register error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
