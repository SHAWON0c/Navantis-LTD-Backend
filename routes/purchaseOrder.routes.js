// const express = require("express");
// const router = express.Router();

// const {
//   createPurchaseOrder,
//   getAllPurchaseOrders,
//   getPurchaseOrderDifferenceOnly,
//   getAllPendingPurchaseOrders
// } = require("../controllers/HQ/purchaseOrder.controller");

// const authMiddleware = require("../middlewares/Authmiddleware");
// const { validateCreatePurchaseOrder } = require("../validation/purchaseOrder.validation");
// const catchAsync = require("../utils/catchAsync");

// // Protected routes: Only superadmin can access
// router.post("/", authMiddleware, validateCreatePurchaseOrder, catchAsync(createPurchaseOrder));

// router.get("/", getAllPurchaseOrders);
// router.get("/differences", getPurchaseOrderDifferenceOnly);
// router.get("/pending", getAllPendingPurchaseOrders);


// module.exports = router;



const express = require("express");
const router = express.Router();

const {
  createPurchaseOrder,
  getAllPurchaseOrders,
  getPurchaseOrderDifferenceOnly,
  getAllPendingPurchaseOrders
} = require("../controllers/HQ/purchaseOrder.controller");

// const authMiddleware = require("../middlewares/Authmiddleware");
const { validateCreatePurchaseOrder } = require("../validation/purchaseOrder.validation");
const catchAsync = require("../utils/catchAsync");
const AuthMiddleware = require("../middlewares/Authmiddleware");

// ✅ Protected routes
router.post(
  "/",
  AuthMiddleware(["admin", "managing-director"]),                     // ensure user is logged in
  validateCreatePurchaseOrder,        // validate request body
  catchAsync(createPurchaseOrder)     // wrap async controller
);

// ✅ Wrap all async GET controllers
router.get("/", catchAsync(getAllPurchaseOrders));
router.get("/differences", catchAsync(getPurchaseOrderDifferenceOnly));
router.get("/pending", catchAsync(getAllPendingPurchaseOrders));

module.exports = router;
