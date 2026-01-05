const WarehouseDamage = require("../../models/WarehouseDamage");
const WarehouseReceive = require("../../models/WarehouseReceive.model");
const WarehouseProduct = require("../../models/WarehouseProduct.model");
const WarehouseStockOut = require("../../models/warehouseStockOut.mode");
exports.createWarehouseDamage = async (req, res) => {
  try {
    const { warehouseReceiveId, damageQuantity, remarks, addedBy } = req.body;

    // 1️⃣ Check if damage already recorded for this warehouseReceiveId
    const existingDamage = await WarehouseDamage.findOne({ warehouseReceiveId });
    if (existingDamage) {
      return res.status(400).json({
        success: false,
        message: "Damage already recorded for this warehouse receive"
      });
    }

    // 2️⃣ Fetch original warehouse receive data
    const receive = await WarehouseReceive.findById(warehouseReceiveId);
    if (!receive) {
      return res.status(404).json({ success: false, message: "Warehouse receive not found" });
    }

    // 3️⃣ Create damage record
    const damage = await WarehouseDamage.create({
      warehouseReceiveId: receive._id,
      purchaseOrderId: receive.purchaseOrderId,
      productName: receive.productName,
      productShortCode: receive.productShortCode,
      netWeight: receive.netWeight,
      batch: receive.batch,
      expireDate: receive.expireDate,
      boxQuantity: receive.boxQuantity,
      productQuantityWithBox: receive.productQuantityWithBox,
      productQuantityWithoutBox: receive.productQuantityWithoutBox,
      damageQuantity,
      remarks,
      addedBy,
      receiveDate: receive.receiveDate
      // status defaults to "pending"
    });

    res.status(201).json({
      success: true,
      message: "Warehouse damage recorded successfully",
      data: damage
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to record warehouse damage"
    });
  }
};



exports.getWarehouseDamageReport = async (req, res) => {
  try {
    // 1️⃣ Fetch all damage records (no filter)
    const damages = await WarehouseDamage.find().sort({ createdAt: -1 });

    // 2️⃣ Format for table
    const report = damages.map((d, index) => {
      const receivedQty = (d.productQuantityWithBox || 0) + (d.productQuantityWithoutBox || 0);
      const damageQty = d.damageQuantity || 0;
      const remainingStock = receivedQty - damageQty;

      return {
        slNo: index + 1,
        id: d._id, // include ID for easier PUT requests
        productName: d.productName,
        batch: d.batch,
        exp: d.expireDate,
        receivedQty,
        damageQty,
        remainingStock,
        remarks: d.remarks || "",
        status: d.status, // pending or approved
        addedBy: d.addedBy,
        warehouseReceiveId: d.warehouseReceiveId,
        purchaseOrderId: d.purchaseOrderId,
        netWeight: d.netWeight
      };
    });

    res.json({
      success: true,
      count: report.length,
      data: report
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch warehouse damage report"
    });
  }
};






// const WarehouseDamage = require("../../models/WarehouseDamage");
// const WarehouseReceive = require("../../models/WarehouseReceive.model");
// const WarehouseProduct = require("../../models/WarehouseProduct");
// const WarehouseStockOut = require("../../models/WarehouseStockOut"); // make sure this model exists

exports.updateWarehouseDamage = async (req, res) => {
  try {
    const { id } = req.params; // WarehouseDamage _id
    const { status } = req.body;

    // 1️⃣ Fetch damage record
    const damage = await WarehouseDamage.findById(id);
    if (!damage) {
      return res.status(404).json({
        success: false,
        message: "Warehouse damage record not found"
      });
    }

    // 2️⃣ Only allow status update
    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required to update"
      });
    }

    // 3️⃣ If already approved, block
    if (damage.status?.toLowerCase() === "approved") {
      return res.status(400).json({
        success: false,
        message: "Damage already approved"
      });
    }

    // 4️⃣ Update status
    damage.status = status;
    await damage.save();

    // 5️⃣ If approved, process stock-out and update WarehouseProduct
    if (status.toLowerCase() === "approved") {

      // Fetch original WarehouseReceive
      const receive = await WarehouseReceive.findById(damage.warehouseReceiveId);
      if (!receive) {
        return res.status(404).json({
          success: false,
          message: "Original warehouse receive not found"
        });
      }

      // Calculate damage quantity
      const damageQty = Number(damage.damageQuantity || 0);
      const qtyWithBox = Number(receive.productQuantityWithBox || 0);
      const qtyWithoutBox = Number(receive.productQuantityWithoutBox || 0);
      const totalReceivedQty = qtyWithBox + qtyWithoutBox;

      if (damageQty > totalReceivedQty) {
        return res.status(400).json({
          success: false,
          message: "Damage quantity cannot exceed received quantity"
        });
      }

      // 5️⃣ Create WarehouseStockOut record
      await WarehouseStockOut.create({
        warehouseReceiveId: receive._id,
        purchaseOrderId: receive.purchaseOrderId,
        productName: receive.productName,
        productCode: receive.productShortCode,
        netWeight: receive.netWeight,
        batch: receive.batch,
        expireDate: receive.expireDate,
        totalQuantity: damageQty,
        remarks: damage.remarks,
        createdAt: new Date()
      });

      // 6️⃣ Update WarehouseProduct totalQuantity
      const productCode = receive.productShortCode;
      const product = await WarehouseProduct.findOne({
        productCode,
        batch: receive.batch,
        "netWeight.value": receive.netWeight?.value,
        "netWeight.unit": receive.netWeight?.unit,
        expireDate: receive.expireDate
      });

      if (product) {
        product.totalQuantity = (product.totalQuantity || 0) - damageQty;
        if (product.totalQuantity < 0) product.totalQuantity = 0; // safeguard
        await product.save();
      }
    }

    res.json({
      success: true,
      message: "Warehouse damage updated successfully",
      data: damage
    });

  } catch (error) {
    console.error("UPDATE WAREHOUSE DAMAGE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update warehouse damage",
      error: error.message
    });
  }
};
