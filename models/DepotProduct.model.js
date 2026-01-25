const mongoose = require("mongoose");

const depotProductSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
    },

    // productName: String,
    // productCode: String,
    // netWeight: Object,

    batch: String,
    expireDate: Date,

    totalQuantity: { type: Number, default: 0 },
    lastStockInDate: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("DepotProduct", depotProductSchema);
