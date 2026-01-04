const PurchaseOrder = require("../models/PurchaseOrder.model");

/**
 * Create Purchase Order
 */
exports.createPurchaseOrder = async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.create({
      ...req.body,
      addedBy: {
        name: "Test User",   // hardcoded for testing
        email: "test@example.com"
      }
    });

    res.status(201).json({
      success: true,
      message: "Purchase order created successfully (TEST)",
      data: purchaseOrder
    });
  } catch (error) {
    console.error("Create Purchase Order Error:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Failed to create purchase order"
    });
  }
};



/**
 * Get All Purchase Orders
 */
exports.getAllPurchaseOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrder.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      data: orders
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch purchase orders"
    });
  }
};
