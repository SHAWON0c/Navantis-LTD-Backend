const express = require("express");
const router = express.Router();
const {
  getAllWarehouseStockOuts,
} = require("../controllers/warehouse/warehouseStockOut.controller");

// 1️⃣ Create a stock-out record (optional if done automatically from damage approval)
// POST /api/warehouse/stockout
// router.post("/stockout", createWarehouseStockOut);

// 2️⃣ Get all stock-out records
// GET /api/warehouse/stockout
router.get("/stockout", getAllWarehouseStockOuts);

// 3️⃣ Get stock-out report (formatted for table)
// GET /api/warehouse/stockout-report
// router.get("/stockout-report", getWarehouseStockOutReport);

module.exports = router;
