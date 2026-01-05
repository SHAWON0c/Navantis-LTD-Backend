const WarehouseStockOut = require("../../models/warehouseStockOut.mode");

exports.getAllWarehouseStockOuts = async (req, res) => {
  try {
    // 1️⃣ Fetch all stock-out records, sorted by creation date descending
    const stockOuts = await WarehouseStockOut.find().sort({ createdAt: -1 });

    // 2️⃣ Send full Mongoose documents
    res.json({
      success: true,
      count: stockOuts.length,
      data: stockOuts
    });
  } catch (error) {
    console.error("GET ALL STOCK-OUTS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch warehouse stock-out records",
      error: error.message
    });
  }
};
