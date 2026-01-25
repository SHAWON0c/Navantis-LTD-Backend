const mongoose = require("mongoose");
const DepotRequest = require("../../models/DepotRequest.model");
const Product = require("../../models/Product.model");
const WarehouseProduct = require("../../models/WarehouseProduct.model"); // ✅ THIS WAS MISSING
const WarehouseStockOut = require("../../models/warehouseStockOut.model");
const { default: DepotStockInModel } = require("../../models/DepotStockIn.model");
const PurchaseOrder = require("../../models/PurchaseOrder.model");
const DepotProduct = require("../../models/DepotProduct.model");
const depotRequestService = require("../../services/depotRequest.service");

// CREATE DEPOT REQUEST
// CREATE DEPOT REQUEST
const createDepotRequest = async (req, res) => {
  try {
    const { requestedBy, warehouseId, quantity } = req.body;

    // Basic validation
    if (!requestedBy || !warehouseId || !quantity) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    if (!mongoose.Types.ObjectId.isValid(warehouseId)) {
      return res.status(400).json({ message: "Invalid warehouse ID" });
    }

    if (quantity <= 0) {
      return res.status(400).json({ message: "Quantity must be greater than 0" });
    }

    // Find the WarehouseProduct by _id (using warehouseId sent from frontend)
    const warehouseProduct = await WarehouseProduct.findById(warehouseId);

    if (!warehouseProduct) {
      return res.status(400).json({ message: "Warehouse product not found" });
    }

    // Check stock availability
    if (quantity > warehouseProduct.totalQuantity) {
      return res.status(400).json({
        message: `Only ${warehouseProduct.totalQuantity} units available`,
      });
    }

    // Prevent duplicate pending request
    const existingRequest = await DepotRequest.findOne({
      requestedBy,
      warehouseProductId: warehouseProduct._id,
      status: "pending",
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "A pending request already exists for this product batch",
      });
    }

    // Create depot request
    const depotRequest = await DepotRequest.create({
      requestedBy,
      warehouseProductId: warehouseProduct._id,
      quantity,
    });

    res.status(201).json({
      message: "Depot request created successfully",
      depotRequest,
    });

  } catch (err) {
    console.error("CREATE DEPOT REQUEST ERROR ❌", err);
    res.status(500).json({ message: "Server error" });
  }
};










// Get all depot requests
// Get depot requests by status
// const getDepotRequestsByStatus = async (req, res) => {
//   try {
//     const { status } = req.params;

//     // Validate status
//     if (!["pending", "approved", "rejected", "requested"].includes(status)) {
//       return res.status(400).json({ message: "Invalid status" });
//     }

//     const requests = await DepotRequest.find({ status })
//       .populate("productId", "productName packSize")
//       .sort({ createdAt: -1 });

//     res.status(200).json({ requests });
//   } catch (err) {
//     console.error("GET DEPOT REQUESTS BY STATUS ERROR ❌", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };


const getDepotRequestsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    // Validate status
    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    // Populate warehouseProductId instead of productId
    const requests = await DepotRequest.find({ status })
      .populate("warehouseProductId", "productName batch packSize totalQuantity")
      .sort({ createdAt: -1 });

    res.status(200).json({ requests });
  } catch (err) {
    console.error("GET DEPOT REQUESTS BY STATUS ERROR ❌", err);
    res.status(500).json({ message: "Server error" });
  }
};







// const updateDepotRequestStatus = async (req, res) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const { id } = req.params;
//     const { status, quantity } = req.body;

//     // 1️⃣ Validate status
//     if (!["approved", "requested", "accepted"].includes(status)) {
//       return res.status(400).json({
//         message: "Status must be 'approved', 'requested', or 'accepted'",
//       });
//     }

//     // 2️⃣ Find depot request
//     const request = await DepotRequest.findById(id)
//       .populate("warehouseProductId")
//       .session(session);

//     if (!request) {
//       return res.status(404).json({ message: "Depot request not found" });
//     }

//     // 🚫 Prevent duplicate accept
//     if (request.status === "accepted") {
//       return res.status(400).json({
//         message: "This request is already accepted",
//       });
//     }

//     // 3️⃣ Quantity validation
//     if (quantity !== undefined) {
//       if (quantity <= 0) {
//         return res
//           .status(400)
//           .json({ message: "Quantity must be greater than 0" });
//       }

//       if (quantity > request.quantity) {
//         return res.status(400).json({
//           message: "Cannot increase quantity beyond requested amount",
//         });
//       }

//       request.quantity = quantity;
//     }

//     // 4️⃣ Update request status
//     request.status = status;
//     await request.save({ session });

//     // 5️⃣ Only when ACCEPTED → stock flow
//     if (status === "accepted") {
//       const warehouseProduct = request.warehouseProductId;

//       if (!warehouseProduct) {
//         throw new Error("Associated warehouse product not found");
//       }

//       const deductQty = request.quantity;

//       // 🏭 5a️⃣ Reduce warehouse stock
//       if (warehouseProduct.totalQuantity < deductQty) {
//         throw new Error("Insufficient warehouse stock");
//       }

//       warehouseProduct.totalQuantity -= deductQty;
//       await warehouseProduct.save({ session });

//       // 📤 5b️⃣ Warehouse Stock Out
//       await WarehouseStockOut.create(
//         [
//           {
//             warehouseReceiveId: warehouseProduct.warehouseReceiveId,
//             purchaseOrderId: warehouseProduct.purchaseOrderId,
//             productName: warehouseProduct.productName,
//             productCode: warehouseProduct.productCode,
//             netWeight: warehouseProduct.netWeight,
//             batch: warehouseProduct.batch,
//             expireDate: warehouseProduct.expireDate,
//             totalQuantity: deductQty,
//             remarks: `Depot request accepted (${request._id})`,
//           },
//         ],
//         { session }
//       );

//       // 📥 5c️⃣ Depot Stock In
//       const depotStockIn = await DepotStockInModel.create(
//         [
//           {
//             purchaseOrderId: warehouseProduct.purchaseOrderId,
//             quantity: deductQty,
//             stockInDate: new Date(),
//             addedBy: req.user?._id || "000000000000000000000001",
//           },
//         ],
//         { session }
//       );

//       // 📦 5d️⃣ Get Purchase Order
//       const purchaseOrder = await PurchaseOrder.findById(
//         warehouseProduct.purchaseOrderId
//       ).session(session);

//       if (!purchaseOrder) {
//         throw new Error("Purchase order not found");
//       }

//       // 🔎 5e️⃣ Check existing Depot Product
//       const existingDepotProduct = await DepotProduct.findOne({
//         productName: purchaseOrder.productName,
//         productCode: warehouseProduct.productCode,
//         batch: warehouseProduct.batch,
//         expireDate: warehouseProduct.expireDate,
//       }).session(session);

//       // 🔁 5f️⃣ Update or Create Depot Product
//       if (existingDepotProduct) {
//         existingDepotProduct.totalQuantity += deductQty;
//         existingDepotProduct.lastStockInDate = new Date();
//         await existingDepotProduct.save({ session });
//       } else {
//         await DepotProduct.create(
//           [
//             {
//               purchaseOrderId: purchaseOrder._id,
//               productId: purchaseOrder.productId,

//               productName: purchaseOrder.productName,
//               productCode: warehouseProduct.productCode,
//               netWeight: purchaseOrder.netWeight,

//               batch: warehouseProduct.batch,
//               expireDate: warehouseProduct.expireDate,

//               totalQuantity: deductQty,
//               lastStockInDate: new Date(),
//             },
//           ],
//           { session }
//         );
//       }
//     }

//     // ✅ Commit transaction
//     await session.commitTransaction();
//     session.endSession();

//     return res.status(200).json({
//       success: true,
//       message: "Depot request updated successfully",
//       request,
//     });
//   } catch (err) {
//     // ❌ Rollback everything on error
//     await session.abortTransaction();
//     session.endSession();

//     console.error("UPDATE DEPOT REQUEST ERROR ❌", err);

//     return res.status(500).json({
//       message: err.message || "Server error",
//     });
//   }
// };

const updateDepotRequestStatus = async (req, res) => {
  try {
    const request = await depotRequestService.updateStatus(
      req.params.id,
      req.body,
      req.user
    );

    res.status(200).json({
      success: true,
      message: "Depot request updated successfully",
      request,
    });
  } catch (err) {
    console.error("UPDATE DEPOT REQUEST ERROR ❌", err);
    res.status(err.status || 500).json({
      message: err.message || "Server error",
    });
  }
};



module.exports = {
  createDepotRequest,
  getDepotRequestsByStatus,
  updateDepotRequestStatus
};
