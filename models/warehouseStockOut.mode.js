// models/WarehouseStockOut.js
const mongoose = require("mongoose");

const warehouseStockOutSchema = new mongoose.Schema(
  {
    warehouseReceiveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WarehouseReceive",
      required: true
    },
    purchaseOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
      required: true
    },
    productName: {
      type: String,
      required: true
    },
    productCode: {
      type: String,
      required: true
    },
    netWeight: {
      value: { type: Number, required: true },
      unit: { type: String, enum: ["ml", "gm"], required: true }
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
      required: true
    },
    remarks: {
      type: String
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("WarehouseStockOut", warehouseStockOutSchema);
