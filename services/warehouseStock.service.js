const WarehouseStockOut = require("../models/warehouseStockOut.model");
const PurchaseOrder = require("../models/PurchaseOrder.model");
const { stockInDepot } = require("./depotStock.service");

exports.processStockAcceptance = async (request, user, session) => {
  const warehouseProduct = request.warehouseProductId;
  const deductQty = request.quantity;

  if (warehouseProduct.totalQuantity < deductQty) {
    throw new Error("Insufficient warehouse stock");
  }

  warehouseProduct.totalQuantity -= deductQty;
  await warehouseProduct.save({ session });

  await WarehouseStockOut.create(
    [{
      warehouseReceiveId: warehouseProduct.warehouseReceiveId,
      purchaseOrderId: warehouseProduct.purchaseOrderId,
      productName: warehouseProduct.productName,
      productCode: warehouseProduct.productCode,
      netWeight: warehouseProduct.netWeight,
      batch: warehouseProduct.batch,
      expireDate: warehouseProduct.expireDate,
      totalQuantity: deductQty,
      remarks: `Depot request accepted (${request._id})`,
    }],
    { session }
  );

  const purchaseOrder = await PurchaseOrder.findById(
    warehouseProduct.purchaseOrderId
  ).session(session);

  if (!purchaseOrder) {
    throw new Error("Purchase order not found");
  }

  await stockInDepot(purchaseOrder, warehouseProduct, deductQty, user, session);
};
