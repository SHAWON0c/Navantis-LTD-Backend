const mongoose = require("mongoose");

const purchaseOrderSchema = new mongoose.Schema(
  {
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

    productQuality: {
      type: String,
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
