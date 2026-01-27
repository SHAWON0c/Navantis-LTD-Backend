// models/WarehouseProduct.js
const mongoose = require("mongoose");

const warehouseProductSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    batch: {
      type: String,
      required: true
    },
    expireDate: {
      type: Date,
      required: true
    },
    totalQuantity: {
      type: Number,
      default: 0
    },
    lastStockInDate: {
      type: Date
    },
    lastWarehouseReceiveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WarehouseReceive",
      required: true
    },
    lastPurchaseOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("WarehouseProduct", warehouseProductSchema);
