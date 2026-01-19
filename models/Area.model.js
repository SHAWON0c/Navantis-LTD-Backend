const mongoose = require("mongoose");

const areaHistorySchema = new mongoose.Schema(
  {
    areaManagerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    zonalManagerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },
    updatedAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const areaSchema = new mongoose.Schema(
  {
    areaName: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    // current assigned managers
    areaManagerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    zonalManagerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null
    },

    // history of assignments
    history: [areaHistorySchema]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Area", areaSchema);
