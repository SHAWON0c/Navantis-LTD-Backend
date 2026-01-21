const mongoose = require("mongoose");

/* ===== Helper: Capitalize First Letter Of Every Word ===== */
const capitalizeWords = (value) => {
  if (!value) return value;

  return value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
};

const customerSchema = new mongoose.Schema(
  {
    customerName: {
      type: String,
      required: true,
      trim: true,
      set: capitalizeWords,
    },

    territoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Territory",
      required: true,
    },

    tradeLicense: {
      type: String,
      required: true,
      trim: true,
    },

    drugLicense: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      set: capitalizeWords,
    },

    mobile: {
      type: String,
      required: true,
      trim: true,
    },

    email: {
      type: String,
      lowercase: true,
      trim: true,
    },

    contactPerson: {
      type: String,
      set: capitalizeWords,
    },

    discount: {
      type: Number,
      default: 0,
    },

    payMode: {
      type: [String], // ["cash", "credit"]
      enum: ["cash", "credit"],
      required: true,
    },

    creditLimit: {
      type: Number,
      default: 0,
    },

    dayLimit: {
      type: Number,
      default: 0,
    },

    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "active"],
      default: "pending",
    },
  },
  { timestamps: true }
);

const Customer = mongoose.model("Customer", customerSchema);
module.exports = Customer;
