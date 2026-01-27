// // controllers/depot/depotRequest.controller.js

// const mongoose = require("mongoose");
// const DepotRequest = require("../../models/DepotRequest.model");
// const WarehouseProduct = require("../../models/WarehouseProduct.model");
// const WarehouseStockOut = require("../../models/warehouseStockOut.model");
// const DepotStockIn = require("../../models/DepotStockIn.model");
// const DepotProduct = require("../../models/DepotProduct.model");
// // ------------------------------
// // CREATE DEPOT REQUEST
// // ------------------------------
// const createDepotRequest = async (req, res) => {
//   try {
//     const { requestedBy, warehouseId, quantity } = req.body;

//     if (!requestedBy || !warehouseId || !quantity) {
//       return res.status(400).json({ message: "Invalid request data" });
//     }

//     if (!mongoose.Types.ObjectId.isValid(warehouseId)) {
//       return res.status(400).json({ message: "Invalid warehouse ID" });
//     }

//     if (quantity <= 0) {
//       return res.status(400).json({ message: "Quantity must be greater than 0" });
//     }

//     const warehouseProduct = await WarehouseProduct.findById(warehouseId);
//     if (!warehouseProduct) {
//       return res.status(400).json({ message: "Warehouse product not found" });
//     }

//     if (quantity > warehouseProduct.totalQuantity) {
//       return res.status(400).json({ message: `Only ${warehouseProduct.totalQuantity} units available` });
//     }

//     const existingRequest = await DepotRequest.findOne({
//       requestedBy,
//       warehouseProductId: warehouseProduct._id,
//       status: "pending",
//     });

//     if (existingRequest) {
//       return res.status(400).json({ message: "A pending request already exists for this product batch" });
//     }

//     const depotRequest = await DepotRequest.create({
//       requestedBy,
//       warehouseProductId: warehouseProduct._id,
//       quantity,
//     });

//     return res.status(201).json({
//       message: "Depot request created successfully",
//       depotRequest,
//     });

//   } catch (err) {
//     console.error("CREATE DEPOT REQUEST ERROR ❌", err);
//     return res.status(500).json({ message: "Server error" });
//   }
// };



// // Update DepotRequest Status
// // updateDepotRequestStatus = async (req, res) => {
// //   try {
// //     const { id } = req.params;           // depotRequest _id
// //     const { status, quantity, addedBy } = req.body;  // addedBy for fallback
// //     const userId = req.user?._id || addedBy;       // fallback if auth not setup

// //     if (!mongoose.Types.ObjectId.isValid(id)) {
// //       return res.status(400).json({ message: "Invalid DepotRequest ID" });
// //     }

// //     if (!["pending", "requested", "accepted", "rejected"].includes(status)) {
// //       return res.status(400).json({ message: "Invalid status value" });
// //     }

// //     // 1️⃣ Fetch depot request
// //     const depotRequest = await DepotRequest.findById(id);
// //     if (!depotRequest) {
// //       return res.status(404).json({ message: "DepotRequest not found" });
// //     }

// //     // -----------------------------
// //     // Pending → Requested
// //     // -----------------------------
// //     if (depotRequest.status === "pending" && status === "requested") {
// //       if (quantity && quantity > 0) depotRequest.quantity = quantity;
// //       depotRequest.status = "requested";
// //       await depotRequest.save();

// //       return res.status(200).json({
// //         message: "Depot request updated to requested",
// //         depotRequest
// //       });
// //     }

// //     // -----------------------------
// //     // Accepted
// //     // -----------------------------
// //     if (status === "accepted") {
// //       if (depotRequest.status === "accepted") {
// //         return res.status(400).json({ message: "Depot request is already accepted" });
// //       }

// //       // 2️⃣ Fetch warehouse product by warehouseProductId from depotRequest
// //       const warehouseProduct = await WarehouseProduct.findById(depotRequest.warehouseProductId);

// //       if (!warehouseProduct) {
// //         return res.status(404).json({ message: "Warehouse product not found" });
// //       }

// //       // 3️⃣ Check stock availability
// //       if (depotRequest.quantity > warehouseProduct.totalQuantity) {
// //         return res.status(400).json({
// //           message: `Not enough stock. Available: ${warehouseProduct.totalQuantity}`
// //         });
// //       }

// //       // 4️⃣ Deduct quantity
// //       warehouseProduct.totalQuantity -= depotRequest.quantity;
// //       await warehouseProduct.save();

// //       // 5️⃣ Create WarehouseStockOut
// //       await WarehouseStockOut.create({
// //         warehouseReceiveId: warehouseProduct.lastWarehouseReceiveId,
// //         purchaseOrderId: warehouseProduct.lastPurchaseOrderId,
// //         productId: warehouseProduct.productId,
// //         totalQuantity: depotRequest.quantity,
// //         remarks: "Depot stock-out for accepted request",
// //         addedBy: userId,
// //         batch: warehouseProduct.batch,
// //         expireDate: warehouseProduct.expireDate
// //       });

// //       // 6️⃣ Create DepotStockIn
// //       await DepotStockIn.create({
// //         purchaseOrderId: warehouseProduct.lastPurchaseOrderId,
// //         quantity: depotRequest.quantity,
// //         addedBy: userId
// //       });

// //       // 7️⃣ Update depotRequest status
// //       depotRequest.status = "accepted";
// //       await depotRequest.save();

// //       return res.status(200).json({
// //         message: "Depot request accepted, stock-out and stock-in created",
// //         depotRequest
// //       });
// //     }

// //     // -----------------------------
// //     // Other statuses (like rejected)
// //     // -----------------------------
// //     depotRequest.status = status;
// //     await depotRequest.save();

// //     return res.status(200).json({
// //       message: `Depot request updated to ${status}`,
// //       depotRequest
// //     });

// //   } catch (error) {
// //     console.error("UPDATE DEPOT REQUEST STATUS ERROR ❌", error);
// //     return res.status(500).json({ message: "Server error", error: error.message });
// //   }
// // };





// // const mongoose = require("mongoose");
// // const DepotRequest = require("../../models/DepotRequest.model");
// // const WarehouseProduct = require("../../models/WarehouseProduct.model");
// // const WarehouseStockOut = require("../../models/warehouseStockOut.model");
// // const DepotStockIn = require("../../models/DepotStockIn.model");


// // Helper function to handle depot stock-in logic
// async function handleDepotStockIn({ productId, batch, expireDate, quantity, addedBy, purchaseOrderId }) {
//   if (!productId || !batch || !expireDate || !quantity || !addedBy) {
//     throw new Error("Missing required fields for depot stock-in");
//   }

//   // Check if DepotProduct exists
//   let depotProduct = await DepotProduct.findOne({ productId, batch, expireDate });
//   if (depotProduct) {
//     depotProduct.totalQuantity += quantity;
//     depotProduct.lastStockInDate = new Date();
//     depotProduct.addedBy = addedBy;
//     await depotProduct.save();
//   } else {
//     depotProduct = await DepotProduct.create({
//       productId,
//       batch,
//       expireDate,
//       totalQuantity: quantity,
//       lastStockInDate: new Date(),
//       addedBy
//     });
//   }

//   // Create DepotStockIn record
//   const depotStockIn = await DepotStockIn.create({
//     purchaseOrderId,
//     quantity,
//     addedBy
//   });

//   return { depotProduct, depotStockIn };
// }

// // ------------------------------
// // UPDATE DEPOT REQUEST STATUS
// // ------------------------------
// const updateDepotRequestStatus = async (req, res) => {
//   try {
//     const { id } = req.params;           // depotRequest _id
//     const { status, quantity, addedBy } = req.body;  // addedBy fallback
//     const userId = req.user?._id || addedBy;        // fallback if auth not setup

//     if (!mongoose.Types.ObjectId.isValid(id)) {
//       return res.status(400).json({ message: "Invalid DepotRequest ID" });
//     }

//     if (!["pending", "requested", "accepted", "rejected"].includes(status)) {
//       return res.status(400).json({ message: "Invalid status value" });
//     }

//     // 1️⃣ Fetch depot request
//     const depotRequest = await DepotRequest.findById(id);
//     if (!depotRequest) {
//       return res.status(404).json({ message: "DepotRequest not found" });
//     }

//     // -----------------------------
//     // Pending → Requested
//     // -----------------------------
//     if (depotRequest.status === "pending" && status === "requested") {
//       if (quantity && quantity > 0) depotRequest.quantity = quantity;
//       depotRequest.status = "requested";
//       await depotRequest.save();

//       return res.status(200).json({
//         message: "Depot request updated to requested",
//         depotRequest
//       });
//     }

//     // -----------------------------
//     // Accepted
//     // -----------------------------
//     if (status === "accepted") {
//       if (depotRequest.status === "accepted") {
//         return res.status(400).json({ message: "Depot request is already accepted" });
//       }

//       // 2️⃣ Fetch warehouse product
//       const warehouseProduct = await WarehouseProduct.findById(depotRequest.warehouseProductId);
//       if (!warehouseProduct) {
//         return res.status(404).json({ message: "Warehouse product not found" });
//       }

//       // 3️⃣ Check stock availability
//       if (depotRequest.quantity > warehouseProduct.totalQuantity) {
//         return res.status(400).json({
//           message: `Not enough stock. Available: ${warehouseProduct.totalQuantity}`
//         });
//       }

//       // 4️⃣ Deduct quantity from warehouse product
//       warehouseProduct.totalQuantity -= depotRequest.quantity;
//       await warehouseProduct.save();

//       // 5️⃣ Create WarehouseStockOut
//       await WarehouseStockOut.create({
//         warehouseReceiveId: warehouseProduct.lastWarehouseReceiveId,
//         purchaseOrderId: warehouseProduct.lastPurchaseOrderId,
//         productId: warehouseProduct.productId,
//         totalQuantity: depotRequest.quantity,
//         remarks: "Depot stock-out for accepted request",
//         addedBy: userId,
//         batch: warehouseProduct.batch,
//         expireDate: warehouseProduct.expireDate
//       });

//       // 6️⃣ Handle DepotStockIn + DepotProducts
//       await handleDepotStockIn({
//         productId: warehouseProduct.productId,
//         batch: warehouseProduct.batch,
//         expireDate: warehouseProduct.expireDate,
//         quantity: depotRequest.quantity,
//         addedBy: userId,
//         purchaseOrderId: warehouseProduct.lastPurchaseOrderId
//       });

//       // 7️⃣ Update depotRequest status
//       depotRequest.status = "accepted";
//       await depotRequest.save();

//       return res.status(200).json({
//         message: "Depot request accepted, stock-out and stock-in created, depot product updated",
//         depotRequest
//       });
//     }

//     // -----------------------------
//     // Other statuses (like rejected)
//     // -----------------------------
//     depotRequest.status = status;
//     await depotRequest.save();

//     return res.status(200).json({
//       message: `Depot request updated to ${status}`,
//       depotRequest
//     });

//   } catch (error) {
//     console.error("UPDATE DEPOT REQUEST STATUS ERROR ❌", error);
//     return res.status(500).json({ message: "Server error", error: error.message });
//   }
// };




// // ------------------------------
// // EXPORT CONTROLLERS
// // ------------------------------
// module.exports = {
//   createDepotRequest,
//   updateDepotRequestStatus
// };



// controllers/depot/depotRequest.controller.js

const mongoose = require("mongoose");
const DepotRequest = require("../../models/DepotRequest.model");
const WarehouseProduct = require("../../models/WarehouseProduct.model");
const WarehouseStockOut = require("../../models/warehouseStockOut.model");
const DepotStockIn = require("../../models/DepotStockIn.model");
const DepotProduct = require("../../models/DepotProduct.model");

// ------------------------------
// CREATE DEPOT REQUEST
// ------------------------------
const createDepotRequest = async (req, res) => {
  try {
    const { requestedBy, warehouseId, quantity } = req.body;

    if (!requestedBy || !warehouseId || !quantity) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    if (!mongoose.Types.ObjectId.isValid(warehouseId)) {
      return res.status(400).json({ message: "Invalid warehouse ID" });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than 0" });
    }

    const warehouseProduct = await WarehouseProduct.findById(warehouseId);
    if (!warehouseProduct) {
      return res.status(400).json({ message: "Warehouse product not found" });
    }

    if (quantity > warehouseProduct.totalQuantity) {
      return res.status(400).json({ message: `Only ${warehouseProduct.totalQuantity} units available` });
    }

    const existingRequest = await DepotRequest.findOne({
      requestedBy,
      warehouseProductId: warehouseProduct._id,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({ message: "A pending request already exists for this product batch" });
    }

    const depotRequest = await DepotRequest.create({
      requestedBy,
      warehouseProductId: warehouseProduct._id,
      quantity,
    });

    return res.status(201).json({
      message: "Depot request created successfully",
      depotRequest,
    });

  } catch (err) {
    console.error("CREATE DEPOT REQUEST ERROR ❌", err);
    return res.status(500).json({ message: "Server error" });
  }
};

// ------------------------------
// HELPER: Handle DepotStockIn + DepotProducts
// ------------------------------
async function handleDepotStockIn({ productId, batch, expireDate, quantity, addedBy, purchaseOrderId, remarks }) {
  if (!productId || !batch || !expireDate || !quantity || !addedBy) {
    throw new Error("Missing required fields for depot stock-in");
  }

  // 1️⃣ Update or create DepotProduct
  let depotProduct = await DepotProduct.findOne({ productId, batch, expireDate });
  if (depotProduct) {
    depotProduct.totalQuantity += quantity;
    depotProduct.lastStockInDate = new Date();
    depotProduct.addedBy = addedBy;
    await depotProduct.save();
  } else {
    depotProduct = await DepotProduct.create({
      productId,
      batch,
      expireDate,
      totalQuantity: quantity,
      lastStockInDate: new Date(),
      addedBy
    });
  }

  // 2️⃣ Create DepotStockIn record with remarks
  const depotStockIn = await DepotStockIn.create({
    purchaseOrderId,
    quantity,
    addedBy,
    remarks: remarks || "Depot stock-in"
  });

  return { depotProduct, depotStockIn };
}

// ------------------------------
// UPDATE DEPOT REQUEST STATUS
// ------------------------------
const updateDepotRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;           // depotRequest _id
    const { status, quantity, addedBy } = req.body;
    const userId = req.user?._id || addedBy;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid DepotRequest ID" });
    }

    if (!["pending", "requested", "accepted", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const depotRequest = await DepotRequest.findById(id);
    if (!depotRequest) {
      return res.status(404).json({ message: "DepotRequest not found" });
    }

    // Pending → Requested
    if (depotRequest.status === "pending" && status === "requested") {
      if (quantity && quantity > 0) depotRequest.quantity = quantity;
      depotRequest.status = "requested";
      await depotRequest.save();

      return res.status(200).json({
        message: "Depot request updated to requested",
        depotRequest
      });
    }

    // Accepted
    if (status === "accepted") {
      if (depotRequest.status === "accepted") {
        return res.status(400).json({ message: "Depot request is already accepted" });
      }

      const warehouseProduct = await WarehouseProduct.findById(depotRequest.warehouseProductId);
      if (!warehouseProduct) {
        return res.status(404).json({ message: "Warehouse product not found" });
      }

      if (depotRequest.quantity > warehouseProduct.totalQuantity) {
        return res.status(400).json({ message: `Not enough stock. Available: ${warehouseProduct.totalQuantity}` });
      }

      // Deduct quantity
      warehouseProduct.totalQuantity -= depotRequest.quantity;
      await warehouseProduct.save();

      // Create WarehouseStockOut
      await WarehouseStockOut.create({
        warehouseReceiveId: warehouseProduct.lastWarehouseReceiveId,
        purchaseOrderId: warehouseProduct.lastPurchaseOrderId,
        productId: warehouseProduct.productId,
        totalQuantity: depotRequest.quantity,
        remarks: `Depot stock-out for accepted request (Warehouse Receive ID: ${warehouseProduct.lastWarehouseReceiveId})`,
        addedBy: userId,
        batch: warehouseProduct.batch,
        expireDate: warehouseProduct.expireDate
      });

      // Create DepotStockIn + update DepotProduct
      await handleDepotStockIn({
        productId: warehouseProduct.productId,
        batch: warehouseProduct.batch,
        expireDate: warehouseProduct.expireDate,
        quantity: depotRequest.quantity,
        addedBy: userId,
        purchaseOrderId: warehouseProduct.lastPurchaseOrderId,
        remarks: `Stock-in from Warehouse Receive ID: ${warehouseProduct.lastWarehouseReceiveId}`
      });

      // Update depotRequest status
      depotRequest.status = "accepted";
      await depotRequest.save();

      return res.status(200).json({
        message: "Depot request accepted, stock-out and stock-in created, depot product updated",
        depotRequest
      });
    }

    // Other statuses (like rejected)
    depotRequest.status = status;
    await depotRequest.save();

    return res.status(200).json({
      message: `Depot request updated to ${status}`,
      depotRequest
    });

  } catch (error) {
    console.error("UPDATE DEPOT REQUEST STATUS ERROR ❌", error);
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ------------------------------
// EXPORT CONTROLLERS
// ------------------------------
module.exports = {
  createDepotRequest,
  updateDepotRequestStatus
};
