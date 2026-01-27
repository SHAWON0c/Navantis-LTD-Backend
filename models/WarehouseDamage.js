const mongoose = require("mongoose");

const warehouseDamageSchema = new mongoose.Schema(
  {
    warehouseReceiveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WarehouseReceive",
      required: true,
      unique: true // prevent duplicate damage entry per receive
    },

    damageQuantity: {
      type: Number,
      required: true,
      min: 1
    },

    remarks: {
      type: String
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // 👈 user id
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

module.exports = mongoose.model("WarehouseDamage", warehouseDamageSchema);
