// // models/WarehouseProduct.js
// const mongoose = require("mongoose");

// const warehouseProductSchema = new mongoose.Schema(
//   {
//     warehouseId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Warehouse",
//       required: false
//     },
//     productName: {
//       type: String,
//       required: true
//     },
//     productCode: {
//       type: String,
//       required: true
//     },
//     netWeight: {
//       value: { type: Number, required: true },
//       unit: { type: String, enum: ["ml", "gm"], required: true }
//     },
//     batch: {
//       type: String,
//       required: true
//     },
//     expireDate: {
//       type: Date,
//       required: true
//     },
//     totalQuantity: {
//       type: Number,
//       default: 0
//     },
//     actualPrice: {
//       type: Number
//     },
//     tradePrice: {
//       type: Number
//     },
//     lastStockInDate: {
//       type: Date
//     },
//     createdAt: {
//       type: Date,
//       default: Date.now
//     }
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("WarehouseProduct", warehouseProductSchema);



// models/WarehouseProduct.js
const mongoose = require("mongoose");

const warehouseProductSchema = new mongoose.Schema(
  {
    warehouseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Warehouse",
      required: false
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
      default: 0
    },
    actualPrice: {
      type: Number
    },
    tradePrice: {
      type: Number
    },
    lastStockInDate: {
      type: Date
    },
    // ✅ New references
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
    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("WarehouseProduct", warehouseProductSchema);
