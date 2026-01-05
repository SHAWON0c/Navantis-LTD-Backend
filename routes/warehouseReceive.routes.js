const express = require("express");
const router = express.Router();

const {
  createWarehouseReceive,
  getAllWarehouseReceives,
  updateWarehouseReceive,
  getAllWarehouseStockIn
} = require("../controllers/warehouse/warehouseReceive.controller");
const authMiddleware = require("../middlewares/authmiddleware");

router.post("/receive", createWarehouseReceive);
router.get("/receive", authMiddleware(["superadmin"]), getAllWarehouseReceives);
router.put("/:id", updateWarehouseReceive);
router.get("/stock-in", getAllWarehouseStockIn);

module.exports = router;
