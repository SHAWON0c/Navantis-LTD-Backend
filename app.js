require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const authRoutes = require('./routes/Auth.routes');
const userRoutes = require('./routes/User.routes');
const purchaseOrderRoutes = require("./routes/purchaseOrder.routes");
const warehouseReceiveRoutes = require("./routes/warehouseReceive.routes");
const warehouseDamageRoutes = require("./routes/warehouseDamage.routes");
const getWarehouseProductList=require("./routes/warehouseProduct.routes");
const warehouseStockOutRoutes = require("./routes/warehouseStockOut.routes");
const designationPermissionRoutes = require("./routes/designationPermission.routes");
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
app.use("/api/warehouse", warehouseReceiveRoutes)
app.use("/api/warehouse", warehouseDamageRoutes);
app.use("/api/warehouse",getWarehouseProductList );
app.use("/api/warehouse", warehouseStockOutRoutes);
app.use("/api/permissions", designationPermissionRoutes);



app.get('/', (req, res) => {
  res.send('🚀 server is running');
});



module.exports = app;