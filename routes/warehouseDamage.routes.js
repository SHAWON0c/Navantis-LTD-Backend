const express = require("express");
const router = express.Router();
const {
  createWarehouseDamage,
  getWarehouseDamageReport,
  updateWarehouseDamage
} = require("../controllers/warehouse/warehouseDamage.controller");

// 1️⃣ Create a new warehouse damage record
// POST /api/warehouse/damage
router.post("/damage", createWarehouseDamage);

// 2️⃣ Get warehouse damage report
// GET /api/warehouse/damage-report
router.get("/damage-report", getWarehouseDamageReport);

// 3️⃣ Update warehouse damage (approve & process stock-out)
// PUT /api/warehouse/damage/:id
router.put("/damage/:id", updateWarehouseDamage);

module.exports = router;
