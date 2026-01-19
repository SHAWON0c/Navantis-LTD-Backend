const WarehouseProduct = require("../../models/WarehouseProduct.model");

exports.getWarehouseProductList = async (req, res) => {
  try {
    const products = await WarehouseProduct.find().sort({ updatedAt: -1 });
    res.json({
      success: true,
      count: products.length,
      data: products
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch warehouse product list"
    });
  }
};
