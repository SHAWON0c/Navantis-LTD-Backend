const mongoose = require("mongoose");

const organizationProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    name: { type: String, required: true },
    phone: String,
    email: String,

    designation: String,

    workplace: { type: String }, // Field / HQ

    territoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Territory"
    },

    profilePic: String,

    joinedAt: { type: Date, default: Date.now },

    history: [
      {
        action: { type: String, required: true },
        oldValue: String,
        newValue: String,
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        date: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("OrganizationProfile", organizationProfileSchema);
