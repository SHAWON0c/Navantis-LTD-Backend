const express = require("express");
const router = express.Router();
const { createWarehouseDamage, getWarehouseDamageReport } = require("../controllers/warehouse/warehouseDamage.controller");

router.post("/damage", createWarehouseDamage);
router.get("/damage-report", getWarehouseDamageReport);

module.exports = router;
