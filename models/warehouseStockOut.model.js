const mongoose = require("mongoose");

const warehouseStockOutSchema = new mongoose.Schema(
  {
    warehouseReceiveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WarehouseReceive",
      required: true,
      unique: false // only one stockout per receive
    },

    totalQuantity: { type: Number, required: true },

    remarks: { type: String, default: "Damaged products" },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    batch: { type: String, required: true },
    expireDate: { type: Date, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("WarehouseStockOut", warehouseStockOutSchema);
