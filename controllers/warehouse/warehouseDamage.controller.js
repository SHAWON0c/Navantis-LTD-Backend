const WarehouseDamage = require("../../models/WarehouseDamage");
const WarehouseReceive = require("../../models/WarehouseReceive.model");

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
    // 1️⃣ Fetch all damage records with status "pending"
    const damages = await WarehouseDamage.find({ status: "pending" })
      .sort({ createdAt: -1 });

    // 2️⃣ Format for table
    const report = damages.map((d, index) => {
      const receivedQty = (d.productQuantityWithBox || 0) + (d.productQuantityWithoutBox || 0);
      const damageQty = d.damageQuantity || 0;
      const remainingStock = receivedQty - damageQty;

      return {
        slNo: index + 1,
        productName: d.productName,
        batch: d.batch,
        exp: d.expireDate,
        receivedQty,
        damageQty,
        remainingStock,
        remarks: d.remarks || "",
        status: d.status // include status if you want to show it
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
