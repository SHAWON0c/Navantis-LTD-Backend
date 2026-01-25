const DepotStockIn = require("../models/DepotStockIn.model");
const DepotProduct = require("../models/DepotProduct.model");

exports.stockInDepot = async (
  purchaseOrder,
  warehouseProduct,
  quantity,
  user,
  session
) => {
  await DepotStockIn.create(
    [{
      purchaseOrderId: purchaseOrder._id,
      quantity,
      stockInDate: new Date(),
      addedBy: user?._id || "000000000000000000000001",
    }],
    { session }
  );

  const existingProduct = await DepotProduct.findOne({
    productName: purchaseOrder.productName,
    productCode: warehouseProduct.productCode,
    batch: warehouseProduct.batch,
    expireDate: warehouseProduct.expireDate,
  }).session(session);

  if (existingProduct) {
    existingProduct.totalQuantity += quantity;
    existingProduct.lastStockInDate = new Date();
    await existingProduct.save({ session });
  } else {
    await DepotProduct.create(
      [{
        purchaseOrderId: purchaseOrder._id,
        productId: purchaseOrder.productId,
        productName: purchaseOrder.productName,
        productCode: warehouseProduct.productCode,
        netWeight: purchaseOrder.netWeight,
        batch: warehouseProduct.batch,
        expireDate: warehouseProduct.expireDate,
        totalQuantity: quantity,
        lastStockInDate: new Date(),
      }],
      { session }
    );
  }
};
