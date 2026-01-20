const mongoose = require("mongoose");
const { Schema } = mongoose;

const targetSchema = new Schema({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product", // assuming you have a Product model
    required: true,
  },
  quantity: { type: Number, required: true },
});

const territorySchema = new Schema(
  {
    territoryName: {
      type: String,
      required: true, // make required if you want every territory to have a name
    },
    areaId: {
      type: Schema.Types.ObjectId,
      ref: "Area",
      required: true,
    },
    marketPoints: [{ type: String }],
    targets: [targetSchema],
    targetMonth: { type: String, required: true }, // format: YYYY-MM
  },
  { timestamps: true }
);

module.exports = mongoose.model("Territory", territorySchema);
