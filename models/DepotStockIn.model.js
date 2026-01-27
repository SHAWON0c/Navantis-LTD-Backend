// models/DepotStockIn.model.js
const mongoose = require("mongoose");

const depotStockInSchema = new mongoose.Schema(
  {
    purchaseOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    stockInDate: {
      type: Date,
      default: Date.now,
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    remarks: {
      type: String,
      default: "Depot stock-in", // default remark
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("DepotStockIn", depotStockInSchema);
