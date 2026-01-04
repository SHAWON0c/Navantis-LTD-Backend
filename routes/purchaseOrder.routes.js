const express = require("express");
const router = express.Router();

const {
  createPurchaseOrder,
  getAllPurchaseOrders
} = require("../controllers/purchaseOrder.controller");

const authMiddleware = require("../middlewares/authmiddleware");

// Protected routes: Only superadmin can access
router.post("/", authMiddleware(["superadmin"]), createPurchaseOrder);
router.get("/", authMiddleware(["superadmin"]), getAllPurchaseOrders);

module.exports = router;
