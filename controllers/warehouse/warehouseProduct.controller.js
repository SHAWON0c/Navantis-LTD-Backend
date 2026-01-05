const WarehouseProduct = require("../../models/WarehouseProduct.model");

exports.getWarehouseProductList = async (req, res) => {
  try {
    const products = await WarehouseProduct.find()
      .sort({ updatedAt: -1 });

    const formattedProducts = products.map((p, index) => ({
      slNo: index + 1,
      _id: p._id,
      productName: p.productName,
      productCode: p.productCode,
      netWeight: `${p.netWeight.value} ${p.netWeight.unit}`,
      batch: p.batch,
      expireDate: p.expireDate,
      actualPrice: p.actualPrice,   // single unit price
      tradePrice: p.tradePrice,     // single unit price
      totalQuantity: p.totalQuantity,
      lastStockInDate: p.lastStockInDate
    }));

    res.json({
      success: true,
      count: formattedProducts.length,
      data: formattedProducts
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch warehouse product list"
    });
  }
};
