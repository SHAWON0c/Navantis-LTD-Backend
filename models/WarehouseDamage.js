const mongoose = require("mongoose");

const warehouseDamageSchema = new mongoose.Schema(
  {
    warehouseReceiveId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WarehouseReceive",
      required: true,
      unique: true // ✅ Prevent duplicates
    },

    purchaseOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
      required: true
    },

    productName: { type: String, required: true },
    productShortCode: { type: String, required: true },

    netWeight: {
      value: { type: Number, required: true },
      unit: { type: String, enum: ["ml", "gm"], required: true }
    },

    batch: { type: String, required: true },
    expireDate: { type: Date, required: true },
    boxQuantity: { type: Number, required: true },
    productQuantityWithBox: { type: Number, required: true },
    productQuantityWithoutBox: { type: Number, required: true },

    damageQuantity: { type: Number, required: true },
    remarks: { type: String },

    addedBy: {
      name: { type: String, required: true },
      email: { type: String, required: true }
    },

    receiveDate: { type: Date, required: true },

    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" } // ✅ Default status
  },
  { timestamps: true }
);

module.exports = mongoose.model("WarehouseDamage", warehouseDamageSchema);
