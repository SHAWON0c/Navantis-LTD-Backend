const mongoose = require("mongoose");

const purchaseOrderSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true
    },

    productName: {
      type: String,
      required: true,
      trim: true
    },

    netWeight: {
      value: {
        type: Number,
        required: true
      },
      unit: {
        type: String,
        enum: ["ml", "gm"],
        required: true
      }
    },

    category: {
      type: String,
      required: true
    },

    productQuantity: {
      type: Number,
      required: true
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
      required: true
    },

    tradePrice: {
      type: Number,
      required: true
    },

    purchaseDate: {
      type: Date,
      default: Date.now
    },

    // ✅ DEFAULT warehouse status
    warehouseStatus: {
      type: String,
      enum: ["pending", "partial", "received"],
      default: "pending"
    },

    addedBy: {
      name: {
        type: String,
        required: true
      },
      email: {
        type: String,
        required: true
      }
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("PurchaseOrder", purchaseOrderSchema);
