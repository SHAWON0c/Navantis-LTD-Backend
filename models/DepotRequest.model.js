// const mongoose = require("mongoose");

// const depotRequestSchema = new mongoose.Schema(
//   {
//     requestedBy: {
//       type: String,
//       required: true,
//     },
//     productId: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Product",
//       required: true
//     },
//     productName: { type: String, required: true },
//     packSize: { type: String, required: true },
//     quantity: { type: Number, required: true, min: 1 },
//     status: {
//       type: String,
//       enum: ["pending", "approved", "rejected", "requested","accepted"],
//       default: "pending"
//     }
//   },
//   { timestamps: true }
// );

// module.exports = mongoose.model("DepotRequest", depotRequestSchema);


const mongoose = require("mongoose");

const depotRequestSchema = new mongoose.Schema(
  {
    requestedBy: {
      type: String,
      required: true,
    },

    warehouseProductId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "WarehouseProduct",
      required: true,
    },

    quantity: {
      type: Number,
      required: true,
      min: 1,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected","accepted"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("DepotRequest", depotRequestSchema);
