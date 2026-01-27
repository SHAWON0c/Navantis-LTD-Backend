// const mongoose = require("mongoose");

// const warehouseStockInSchema = new mongoose.Schema(
//   {
//     warehouseReceiveId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "WarehouseReceive",
//       required: true,
//       unique: true
//     },
//     purchaseOrderId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "PurchaseOrder",
//       required: true
//     },
//     productName: { type: String, required: true },
//     productShortCode: { type: String, required: true },
//     netWeight: {
//       value: { type: Number, required: true },
//       unit: { type: String, enum: ["ml", "gm"], required: true }
//     },
//     batch: { type: String, required: true },
//     expireDate: { type: Date, required: true },
//     boxQuantity: { type: Number, required: true },
//     productQuantityWithBox: { type: Number, required: true },
//     productQuantityWithoutBox: { type: Number, required: true },
//     remarks: String,
//     addedBy: {
//       name: { type: String, required: true },
//       email: { type: String, required: true }
//     },
//     stockInDate: { type: Date, default: Date.now }
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("WarehouseStockIn", warehouseStockInSchema);




const mongoose = require("mongoose");

const warehouseStockInSchema = new mongoose.Schema(
  {
    warehouseReceiveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WarehouseReceive",
      required: true,
      unique: true
    },
    totalQuantity: {
      type: Number,
      required: true
    },
    remarks: {
      type: String
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // Assuming you have a User model
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("WarehouseStockIn", warehouseStockInSchema);
