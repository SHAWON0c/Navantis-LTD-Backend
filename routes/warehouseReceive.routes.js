// const express = require("express");
// const router = express.Router();

// const {
//   createWarehouseReceive,
//   getAllWarehouseReceives,
//   updateWarehouseReceive,
//   getAllWarehouseStockIn
// } = require("../controllers/warehouse/warehouseReceive.controller");

// router.post("/receive", createWarehouseReceive);
// router.get("/receive", getAllWarehouseReceives);
// router.put("/:id", updateWarehouseReceive);
// router.get("/stock-in", getAllWarehouseStockIn);

// module.exports = router;


const express = require("express");
const router = express.Router();

const {
  createWarehouseReceive,
  getAllWarehouseReceives,
  updateWarehouseReceive,
  getAllWarehouseStockIn
} = require("../controllers/warehouse/warehouseReceive.controller");

const {
  createWarehouseReceiveValidation
} = require("../validation/warehouseReceive.validator");

const { validate } = require("../middlewares/validate");
const AuthMiddleware = require("../middlewares/Authmiddleware");

// 📥 Create warehouse receive (PENDING)
router.post(
  "/receive",
  AuthMiddleware(),
  // createWarehouseReceiveValidation,
  // validate,
  createWarehouseReceive
);

// 📄 Get all warehouse receives
router.get(
  "/receive",
    AuthMiddleware(["admin", "managing-director"]),  
  getAllWarehouseReceives
);

// ✏️ Update warehouse receive (approve / reject)
router.put(
  "/receive/:id",
    AuthMiddleware(),
  updateWarehouseReceive
);

// 📦 Get all stock-in (approved receives)
router.get(
  "/stock-in",
    AuthMiddleware(),
  getAllWarehouseStockIn
);

module.exports = router;
