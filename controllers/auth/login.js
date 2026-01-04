// // controllers/auth/login.js
// const User = require('../../models/User');
// const jwt = require('jsonwebtoken');

// exports.login = async (req, res) => {
//   const { email, password } = req.body;

//   // Validate input
//   if (!email || !password) {
//     return res.status(400).json({ message: 'Email and password are required' });
//   }

//   try {
//     // Find user by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(401).json({ message: 'Invalid credentials' }); // Unauthorized
//     }

//     // Check if user is verified
//     if (!user.isVerified) {
//       return res.status(403).json({ message: 'User not verified' }); // Forbidden
//     }

//     // Compare password
//     const isMatch = await user.comparePassword(password);
//     if (!isMatch) {
//       return res.status(401).json({ message: 'Invalid credentials' }); // Unauthorized
//     }

//     // Generate JWT
//     const token = jwt.sign(
//       { userId: user._id, email: user.email },
//       process.env.JWT_SECRET,
//       { expiresIn: '1h' }
//     );

//     // Successful login
//     res.status(200).json({ message: 'Login successful', token });
//   } catch (err) {
//     console.error('Login error:', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


// controllers/auth/login.js
const User = require('../../models/User');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { email, password } = req.body;

  // Validate input
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  try {
    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' }); // Unauthorized
    }

    // Check if user is verified
    if (!user.isVerified) {
      return res.status(403).json({ message: 'User not verified' }); // Forbidden
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' }); // Unauthorized
    }

    // Generate JWT with role
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        role: user.role // <-- include the role here
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Successful login
    res.status(200).json({ message: 'Login successful', token, role: user.role });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
