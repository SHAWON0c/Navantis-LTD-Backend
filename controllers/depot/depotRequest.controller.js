const mongoose = require("mongoose");
const DepotRequest = require("../../models/DepotRequest.model");
const Product = require("../../models/Product.model");
const WarehouseProduct = require("../../models/WarehouseProduct.model"); // ✅ THIS WAS MISSING
const WarehouseStockOut = require("../../models/warehouseStockOut.mode");
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

module.exports = { createDepotRequest };











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






// Update request status
// const updateDepotRequestStatus = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { status, quantity } = req.body; // quantity is optional

//     // Validate status
//     if (!["approved", "requested","accepted"].includes(status)) {
//       return res.status(400).json({ message: "Status must be 'approved' or 'requested'" });
//     }

//     // Find the request
//     const request = await DepotRequest.findById(id);
//     if (!request) return res.status(404).json({ message: "Depot request not found" });

//     // If quantity is provided, reduce it (cannot increase beyond original)
//     if (quantity !== undefined) {
//       if (quantity <= 0) {
//         return res.status(400).json({ message: "Quantity must be greater than 0" });
//       }
//       if (quantity > request.quantity) {
//         return res.status(400).json({ message: "Cannot increase quantity beyond requested amount" });
//       }
//       request.quantity = quantity;
//     }

//     // Update status
//     request.status = status;
//     await request.save();

//     res.status(200).json({
//       message: "Depot request updated successfully",
//       request
//     });

//   } catch (err) {
//     console.error("UPDATE DEPOT REQUEST ERROR ❌", err);
//     res.status(500).json({ message: "Server error" });
//   }
// };




const updateDepotRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, quantity } = req.body;

    // 1️⃣ Validate status
    if (!["approved", "requested", "accepted"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'approved', 'requested', or 'accepted'" });
    }

    // 2️⃣ Find the depot request
    const request = await DepotRequest.findById(id).populate("warehouseProductId");
    if (!request) return res.status(404).json({ message: "Depot request not found" });

    // 3️⃣ Validate and update quantity if provided
    if (quantity !== undefined) {
      if (quantity <= 0) return res.status(400).json({ message: "Quantity must be greater than 0" });
      if (quantity > request.quantity) return res.status(400).json({ message: "Cannot increase quantity beyond requested amount" });
      request.quantity = quantity;
    }

    // 4️⃣ Update status
    request.status = status;
    await request.save();

    // 5️⃣ If accepted, update warehouse stock and create stock-out
    if (status === "accepted") {
      const warehouseProduct = request.warehouseProductId;
      if (!warehouseProduct) {
        return res.status(404).json({ message: "Associated warehouse product not found" });
      }

      const deductQty = request.quantity || 0;

      // 5a️⃣ Update WarehouseProduct quantity
      warehouseProduct.totalQuantity = (warehouseProduct.totalQuantity || 0) - deductQty;
      if (warehouseProduct.totalQuantity < 0) warehouseProduct.totalQuantity = 0; // safeguard
      await warehouseProduct.save();

      // 5b️⃣ Create WarehouseStockOut record
      await WarehouseStockOut.create({
        warehouseReceiveId: warehouseProduct.warehouseReceiveId,
        purchaseOrderId: warehouseProduct.purchaseOrderId,
        productName: warehouseProduct.productName,
        productCode: warehouseProduct.productCode,
        netWeight: warehouseProduct.netWeight,
        batch: warehouseProduct.batch,
        expireDate: warehouseProduct.expireDate,
        totalQuantity: deductQty,
        remarks: `Depot request accepted: ${request._id}`,
        createdAt: new Date()
      });
    }

    res.status(200).json({
      message: "Depot request updated successfully",
      request
    });

  } catch (err) {
    console.error("UPDATE DEPOT REQUEST ERROR ❌", err);
    res.status(500).json({ message: "Server error" });
  }
};



module.exports = {
  createDepotRequest,
  getDepotRequestsByStatus,
  updateDepotRequestStatus
};
