const mongoose = require('mongoose');

const productSchema = new mongoose.Schema(
  {
    productName: {
      type: String,
      required: true,
      trim: true
    },
    brand: {
      type: String,
      required: true,
      trim: true
    },
    productShortCode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },
    packSize: {
      type: String,
      required: true,
      trim: true
    },
    category: {  // <-- Added category field
      type: String,
      required: true,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Product', productSchema);
