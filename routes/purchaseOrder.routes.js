const express = require("express");
const router = express.Router();

const {
  createPurchaseOrder,
  getAllPurchaseOrders
} = require("../controllers/purchaseOrder.controller");

const authMiddleware = require("../middlewares/authmiddleware");

// Protected routes
router.post("/", authMiddleware, createPurchaseOrder);
router.get("/", authMiddleware, getAllPurchaseOrders);

module.exports = router;
