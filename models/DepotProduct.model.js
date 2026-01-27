const mongoose = require("mongoose");

const depotProductSchema = new mongoose.Schema(
  {
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    batch: { type: String, required: true },
    expireDate: { type: Date, required: true },
    totalQuantity: { type: Number, required: true, default: 0 },
    lastStockInDate: { type: Date, default: Date.now },
    addedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("DepotProduct", depotProductSchema);
