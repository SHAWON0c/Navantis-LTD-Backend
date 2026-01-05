const express = require("express");
const router = express.Router();

const {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrderDifferenceOnly
} = require("../controllers/HQ/purchaseOrder.controller");

const authMiddleware = require("../middlewares/Authmiddleware");

// Protected routes: Only superadmin can access
router.post("/", createPurchaseOrder);
router.get("/", getAllPurchaseOrders);
router.get("/differences", getPurchaseOrderDifferenceOnly);

module.exports = router;
