const mongoose = require("mongoose");

const warehouseReceiveSchema = new mongoose.Schema(
  {
    purchaseOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
      required: true,
      unique: true
    },

    receiveDate: {
      type: Date,
      default: Date.now
    },

    boxQuantity: {
      type: Number,
      required: true
    },

    productQuantityWithBox: {
      type: Number,
      required: true
    },

    productQuantityWithoutBox: {
      type: Number,
      required: true
    },

    remarks: {
      type: String,
      trim: true
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("WarehouseReceive", warehouseReceiveSchema);
