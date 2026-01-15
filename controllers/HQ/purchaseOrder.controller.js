const PurchaseOrder = require("../../models/PurchaseOrder.model");
const WarehouseReceive = require("../../models/WarehouseReceive.model");

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
// exports.getAllPurchaseOrders = async (req, res) => {
//   try {
//     const orders = await PurchaseOrder.find()
//       .select(
//         "productName netWeight.value netWeight.unit category productQuality batch expireDate purchaseDate createdAt"
//       )
//       .sort({ createdAt: -1 });

//     const formattedOrders = orders.map(o => ({
//       date: o.purchaseDate || o.createdAt,
//       productName: o.productName,
//       netWeight: `${o.netWeight.value} ${o.netWeight.unit}`,
//       category: o.category,
//       quality: o.productQuality,
//       batch: o.batch,
//       expireDate: o.expireDate
//     }));

//     res.json({
//       success: true,
//       data: formattedOrders
//     });
//   } catch (error) {
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch purchase orders"
//     });
//   }
// };


exports.getAllPurchaseOrders = async (req, res) => {
  try {
    // Fetch all orders, no field selection, sorted by creation date
    const orders = await PurchaseOrder.find().sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch purchase orders"
    });
  }
};


exports.getAllPendingPurchaseOrders = async (req, res) => {
  try {
    const orders = await PurchaseOrder.find({
      warehouseStatus: "pending"
    }).sort({ createdAt: -1 });

    res.json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch pending purchase orders"
    });
  }
};





// const PurchaseOrder = require("../models/PurchaseOrder");
// const WarehouseReceive = require("../models/WarehouseReceive");

exports.getPurchaseOrderDifferenceOnly = async (req, res) => {
  try {
    // 1️⃣ Fetch all warehouse receives
    const warehouseReceives = await WarehouseReceive.find();

    // 2️⃣ Map purchaseOrderId → total received quantity
    const receivedMap = {};
    warehouseReceives.forEach(r => {
      const poId = r.purchaseOrderId.toString();
      const totalReceived =
        (r.productQuantityWithBox || 0) + (r.productQuantityWithoutBox || 0);

      receivedMap[poId] = (receivedMap[poId] || 0) + totalReceived;
    });

    // 3️⃣ Fetch all purchase orders
    const purchaseOrders = await PurchaseOrder.find();

    // 4️⃣ Calculate stock vs order vs missing
    const result = purchaseOrders.map((po, index) => {
      const stockQuantity = receivedMap[po._id.toString()] || 0;
      const orderQuantity = po.productQuantity || 0;
      const missingQuantity = orderQuantity - stockQuantity;

      return {
        slNo: index + 1,
        purchaseOrderId: po._id,
        productName: po.productName,
        batch: po.batch,
        exp: po.expireDate,
        orderQuantity,
        stockQuantity,
        missingQuantity: missingQuantity < 0 ? 0 : missingQuantity // avoid negative
      };
    });

    res.json({ success: true, count: result.length, data: result });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch purchase order differences"
    });
  }
};
