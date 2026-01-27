const express = require("express");
const router = express.Router();
const {
  createWarehouseDamage,
  getWarehouseDamageReport,
  updateWarehouseDamage,
  getAllWarehouseDamages,
  getPendingWarehouseDamages,
  approveWarehouseDamage
} = require("../controllers/warehouse/warehouseDamage.controller");

const AuthMiddleware = require("../middlewares/Authmiddleware");

// 1️⃣ Create a new warehouse damage record
// POST /api/warehouse/damage
router.post("/damage",   AuthMiddleware(["admin", "managing-director"]),  createWarehouseDamage);

router.get("/pening", getPendingWarehouseDamages);


router.put(
  "/approve/:id",
 AuthMiddleware(["admin", "managing-director"]), 
approveWarehouseDamage
);


module.exports = router;
