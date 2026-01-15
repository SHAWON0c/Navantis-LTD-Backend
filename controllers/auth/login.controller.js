const User = require('../../models/User.model');
const jwt = require('jsonwebtoken');

exports.login = async (req, res) => {
  const { employeeId, password } = req.body;

  // 1️⃣ Validate input
  if (!employeeId || !password) {
    return res.status(400).json({
      message: 'Employee ID and password are required'
    });
  }

  try {
    // 2️⃣ Find user by employeeId
    const user = await User.findOne({ employeeId });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 3️⃣ Check verification
    if (!user.isVerified) {
      return res.status(403).json({ message: 'User not verified' });
    }

    // 4️⃣ Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // 5️⃣ Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
        employeeId: user.employeeId,
        role: user.role
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // 6️⃣ Response
    res.status(200).json({
      message: 'Login successful',
      token,
      role: user.role
    });

  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};
