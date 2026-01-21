// const app = require('./app');

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//   console.log(`✅ Server running on port ${PORT}`);
// });



// // server.js (VERY FIRST LINE)
// require('dotenv').config();  // 🔥 MUST be first
// const app = require('./app');

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//   console.log(`✅ Server running on port ${PORT}`);
// });




// Must be first: load environment variables
require('dotenv').config();  // 🔥 MUST be first

const app = require('./app');

// Use dynamic port from CloudLinux or fallback
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use. Try restarting the app or use a different port.`);
  } else {
    console.error('Server error:', err);
  }
});
