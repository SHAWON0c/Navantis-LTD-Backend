const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema(
  {
    doctorName: {
      type: String,
      required: true,
      trim: true
    },
    territory: {
      type: String,
      required: true,
      trim: true
    },
    doctorLicense: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    address: {
      type: String,
      trim: true
    },
    mobileNo: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      trim: true
    },
    contactNo: {
      type: String,
      trim: true
    },
    discount: {
      type: Number,
      default: 0 // optional, defaults to 0
    },
    addedBy: {
      name: { type: String, required: true }, // Who added this doctor
      email: { type: String, required: true }
    },
    accountBalance: {
      type: Number,
      default: 0
    },
    products: [
      {
        productId: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: {
          type: Number,
          required: true,
          default: 0
        },
        price: {
          type: Number,
          required: true,
          default: 0
        },
        dateSent: {
          type: Date,
          default: Date.now
        }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model('Doctor', doctorSchema);
