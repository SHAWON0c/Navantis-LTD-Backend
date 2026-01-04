require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const purchaseOrderRoutes = require("./routes/purchaseOrder.routes");

const app = express();

// Connect DB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes );
app.use("/api/purchase-orders",purchaseOrderRoutes)


app.get('/', (req, res) => {
  res.send('🚀 API is running');
});



module.exports = app;