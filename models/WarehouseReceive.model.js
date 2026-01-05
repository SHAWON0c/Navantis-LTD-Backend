const mongoose = require("mongoose");

const warehouseReceiveSchema = new mongoose.Schema(
  {
    // 🔗 CONNECTION WITH PURCHASE ORDER
    purchaseOrderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PurchaseOrder",
      required: true,
      unique: true
    },

    receiveDate: {
      type: Date,
      default: Date.now,
      required: true
    },

    productName: {
      type: String,
      required: true
    },

    productShortCode: {
      type: String,
      required: true
    },

    netWeight: {
      value: { type: Number, required: true },
      unit: { type: String, enum: ["ml", "gm"], required: true }
    },

    batch: { type: String, required: true },

    expireDate: { type: Date, required: true },

    boxQuantity: { type: Number, required: true },

    productQuantityWithBox: { type: Number, required: true },

    productQuantityWithoutBox: { type: Number, required: true },

    remarks: String,

    addedBy: {
      name: { type: String, required: true },
      email: { type: String, required: true }
    },

    // ✅ STATUS FIELD
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending" // automatically set new records as pending
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("WarehouseReceive", warehouseReceiveSchema);
