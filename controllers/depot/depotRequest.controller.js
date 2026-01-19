const DepotRequest = require("../../models/DepotRequest.model");
const Product = require("../../models/Product.model");

// Create a single-product depot request
const createDepotRequest = async (req, res) => {
  try {
    const { requestedBy, productId, quantity } = req.body;

    if (!requestedBy || !productId || !quantity) {
      return res.status(400).json({ message: "Invalid request data" });
    }

    // Validate product exists
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(400).json({ message: "Product not found" });
    }

    // Check if there's already a pending request for this product by this depot
    const existingRequest = await DepotRequest.findOne({
      requestedBy,
      productId,
      status: "pending"
    });

    if (existingRequest) {
      return res.status(400).json({
        message: "A pending request for this product already exists"
      });
    }

    // Create new depot request
    const depotRequest = await DepotRequest.create({
      requestedBy,
      productId,
      productName: product.productName,
      packSize: product.packSize,
      quantity
    });

    res.status(201).json({
      message: "Depot request created",
      depotRequest
    });

  } catch (err) {
    console.error("CREATE DEPOT REQUEST ERROR ❌", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Get all depot requests
// Get depot requests by status
const getDepotRequestsByStatus = async (req, res) => {
  try {
    const { status } = req.params;

    // Validate status
    if (!["pending", "approved", "rejected", "requested"].includes(status)) {
      return res.status(400).json({ message: "Invalid status" });
    }

    const requests = await DepotRequest.find({ status })
      .populate("productId", "productName packSize")
      .sort({ createdAt: -1 });

    res.status(200).json({ requests });
  } catch (err) {
    console.error("GET DEPOT REQUESTS BY STATUS ERROR ❌", err);
    res.status(500).json({ message: "Server error" });
  }
};





// Update request status
const updateDepotRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, quantity } = req.body; // quantity is optional

    // Validate status
    if (!["approved", "requested"].includes(status)) {
      return res.status(400).json({ message: "Status must be 'approved' or 'requested'" });
    }

    // Find the request
    const request = await DepotRequest.findById(id);
    if (!request) return res.status(404).json({ message: "Depot request not found" });

    // If quantity is provided, reduce it (cannot increase beyond original)
    if (quantity !== undefined) {
      if (quantity <= 0) {
        return res.status(400).json({ message: "Quantity must be greater than 0" });
      }
      if (quantity > request.quantity) {
        return res.status(400).json({ message: "Cannot increase quantity beyond requested amount" });
      }
      request.quantity = quantity;
    }

    // Update status
    request.status = status;
    await request.save();

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
