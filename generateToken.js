require('dotenv').config();
const jwt = require('jsonwebtoken');

const token = jwt.sign(
  {
    userId: '695b603cb8746a020eafef87',
    email: 'devofficials.shawon@gmail.com',
    role: 'IT-Officer'
  },
  process.env.JWT_SECRET, // ✅ same as in .env
  { expiresIn: '1d' }
);

console.log('New Token:', token);
