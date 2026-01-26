const mongoose = require("mongoose");

const marketPointSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    territoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Territory",
      required: true,
    },
  },
  { timestamps: true }
);

// prevent duplicate market point in same territory
marketPointSchema.index({ name: 1, territoryId: 1 }, { unique: true });

module.exports = mongoose.model("MarketPoint", marketPointSchema);
