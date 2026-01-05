const mongoose = require("mongoose");

const organizationProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true // one profile per user
    },
    name: { type: String, required: true },
    phone: { type: String },
    email: { type: String },
    designation: { type: String },
    workplace: { type: String }, // e.g., Field / HQ
    territory: { type: String },
    area: { type: String },
    areaManager: { type: String },
    zonalManager: { type: String },
    profilePic: { type: String }, // store URL/path
    joinedAt: { type: Date, default: Date.now },
    history: [
      {
        action: { type: String },
        date: { type: Date, default: Date.now },
        details: { type: String }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("OrganizationProfile", organizationProfileSchema);
