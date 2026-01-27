const mongoose = require("mongoose");
const WarehouseDamage = require("../../models/WarehouseDamage");
const WarehouseReceive = require("../../models/WarehouseReceive.model");
const PurchaseOrder = require("../../models/PurchaseOrder.model");
const WarehouseProduct = require("../../models/WarehouseProduct.model");
const WarehouseStockOut = require("../../models/warehouseStockOut.model");


exports.createWarehouseDamage = async (req, res) => {
  try {
    const { warehouseReceiveId, damageQuantity, remarks } = req.body;
    const userId = req.user._id; // assuming auth middleware sets req.user

    // 1️⃣ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(warehouseReceiveId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid warehouseReceiveId"
      });
    }

    // 2️⃣ Prevent duplicate damage record
    const existingDamage = await WarehouseDamage.findOne({ warehouseReceiveId });
    if (existingDamage) {
      return res.status(400).json({
        success: false,
        message: "Damage already recorded for this warehouse receive"
      });
    }

    // 3️⃣ Fetch WarehouseReceive
    const receive = await WarehouseReceive.findById(warehouseReceiveId);
    if (!receive) {
      return res.status(404).json({
        success: false,
        message: "Warehouse receive not found"
      });
    }

    // 4️⃣ Validate damageQuantity
    const totalReceived =
      Number(receive.productQuantityWithBox || 0) +
      Number(receive.productQuantityWithoutBox || 0);

    if (damageQuantity <= 0 || damageQuantity > totalReceived) {
      return res.status(400).json({
        success: false,
        message: `Invalid damage quantity. Must be between 1 and ${totalReceived}`
      });
    }

    // 5️⃣ Create WarehouseDamage record
    const damage = await WarehouseDamage.create({
      warehouseReceiveId,
      damageQuantity,
      remarks,
      addedBy: userId
      // status defaults to "pending"
    });

    return res.status(201).json({
      success: true,
      message: "Warehouse damage recorded successfully",
      data: damage
    });

  } catch (error) {
    console.error("CREATE WAREHOUSE DAMAGE ERROR ❌", error);
    return res.status(500).json({
      success: false,
      message: "Failed to record warehouse damage",
      error: error.message
    });
  }
};



// const mongoose = require("mongoose");
// const WarehouseDamage = require("../models/WarehouseDamage");
// const WarehouseReceive = require("../models/WarehouseReceive");
// const PurchaseOrder = require("../models/PurchaseOrder");

exports.getPendingWarehouseDamages = async (req, res) => {
  try {
    const pendingDamages = await WarehouseDamage.aggregate([
      // 1️⃣ Filter only pending damages
      { $match: { status: "pending" } },

      // 2️⃣ Lookup WarehouseReceive
      {
        $lookup: {
          from: "warehousereceives",
          localField: "warehouseReceiveId",
          foreignField: "_id",
          as: "warehouseReceive"
        }
      },
      { $unwind: "$warehouseReceive" },

      // 3️⃣ Lookup PurchaseOrder
      {
        $lookup: {
          from: "purchaseorders",
          localField: "warehouseReceive.purchaseOrderId",
          foreignField: "_id",
          as: "purchaseOrder"
        }
      },
      { $unwind: "$purchaseOrder" },

      // 4️⃣ Project the final response
      {
        $project: {
          _id: 1,
          damageQuantity: 1,
          remarks: 1,
          status: 1,
          addedBy: 1,
          createdAt: 1,
          updatedAt: 1,

          warehouseReceive: {
            boxQuantity: "$warehouseReceive.boxQuantity",
            productQuantityWithBox: "$warehouseReceive.productQuantityWithBox",
            productQuantityWithoutBox: "$warehouseReceive.productQuantityWithoutBox",
            receiveDate: "$warehouseReceive.receiveDate",
            productName: "$warehouseReceive.productName",
            productShortCode: "$warehouseReceive.productShortCode",
            batch: "$warehouseReceive.batch",
            expireDate: "$warehouseReceive.expireDate"
          },

          purchaseOrder: {
            _id: "$purchaseOrder._id",
            productId: "$purchaseOrder.productId",
            productQuantity: "$purchaseOrder.productQuantity",
            actualPrice: "$purchaseOrder.actualPrice",
            tradePrice: "$purchaseOrder.tradePrice",
            addedBy: "$purchaseOrder.addedBy",
            purchaseDate: "$purchaseOrder.purchaseDate"
          }
        }
      },

      // 5️⃣ Sort by newest first
      { $sort: { createdAt: -1 } }
    ]);

    return res.status(200).json({
      success: true,
      data: pendingDamages
    });

  } catch (error) {
    console.error("GET PENDING WAREHOUSE DAMAGES ERROR ❌", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch pending warehouse damages",
      error: error.message
    });
  }
};




// const mongoose = require("mongoose");
// const WarehouseDamage = require("../models/WarehouseDamage");
// const WarehouseReceive = require("../models/WarehouseReceive");
// const PurchaseOrder = require("../models/PurchaseOrder");


exports.approveWarehouseDamage = async (req, res) => {
  try {
    const { id } = req.params; // WarehouseDamage _id
    const userId = req.user._id; // from auth middleware

    // 1️⃣ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: "Invalid damage ID" });
    }

    // 2️⃣ Fetch damage record
    const damage = await WarehouseDamage.findById(id);
    if (!damage) {
      return res.status(404).json({ success: false, message: "Damage record not found" });
    }

    if (damage.status === "approved") {
      return res.status(400).json({ success: false, message: "Already approved" });
    }

    // 3️⃣ Fetch warehouse receive
    const receive = await WarehouseReceive.findById(damage.warehouseReceiveId);
    if (!receive) {
      return res.status(404).json({ success: false, message: "Warehouse receive not found" });
    }

    // 4️⃣ Fetch purchase order
    const purchaseOrder = await PurchaseOrder.findById(receive.purchaseOrderId);
    if (!purchaseOrder) {
      return res.status(404).json({ success: false, message: "Purchase order not found" });
    }

    // 5️⃣ Find WarehouseProduct and subtract damageQuantity
    const warehouseProduct = await WarehouseProduct.findOne({
      productId: purchaseOrder.productId,
      batch: purchaseOrder.batch,
      expireDate: purchaseOrder.expireDate
    });

    if (!warehouseProduct) {
      return res.status(404).json({ success: false, message: "Warehouse product not found" });
    }

    if (damage.damageQuantity > warehouseProduct.totalQuantity) {
      return res.status(400).json({ success: false, message: "Damage quantity exceeds available stock" });
    }

    warehouseProduct.totalQuantity -= damage.damageQuantity;
    await warehouseProduct.save();

    // 6️⃣ Create WarehouseStockOut
    await WarehouseStockOut.create({
      warehouseReceiveId: receive._id,
      purchaseOrderId: purchaseOrder._id,
      productId: purchaseOrder.productId,
      batch: purchaseOrder.batch,
      expireDate: purchaseOrder.expireDate,
      totalQuantity: damage.damageQuantity,
      remarks: "Damaged products",
      addedBy: userId
    });

    // 7️⃣ Update damage status to approved
    damage.status = "approved";
    await damage.save();

    return res.status(200).json({
      success: true,
      message: "Damage approved and stock out created successfully",
      data: damage
    });

  } catch (error) {
    console.error("APPROVE WAREHOUSE DAMAGE ERROR ❌", error);
    return res.status(500).json({ success: false, message: error.message });
  }
};
