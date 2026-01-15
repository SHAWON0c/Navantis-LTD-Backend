// const app = require('./app');

// const PORT = process.env.PORT || 3000;

// app.listen(PORT, () => {
//   console.log(`✅ Server running on port ${PORT}`);
// });



// server.js (VERY FIRST LINE)
require('dotenv').config();  // 🔥 MUST be first
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
