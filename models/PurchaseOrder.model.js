const mongoose = require("mongoose");

const purchaseOrderSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },
    productQuantity: {
      type: Number,
      required: true,
      min: 1
    },
    batch: {
      type: String,
      required: true
    },
    expireDate: {
      type: Date,
      required: true
    },
    actualPrice: {
      type: Number,
      required: true,
      min: 0
    },
    tradePrice: {
      type: Number,
      required: true,
      min: 0
    },
    purchaseDate: {
      type: Date,
      default: Date.now
    },
    warehouseStatus: {
      type: String,
      enum: ["pending", "received"],
      default: "pending"
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  { timestamps: true }
);

// Compound index to prevent duplicate product+batch entries
purchaseOrderSchema.index({ productId: 1, batch: 1 }, { unique: true });

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema);
