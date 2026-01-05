const express = require("express");
const router = express.Router();
const {
  getWarehouseProductList
} = require("../controllers/warehouse/warehouseProduct.controller");

router.get("/products", getWarehouseProductList);

module.exports = router;
