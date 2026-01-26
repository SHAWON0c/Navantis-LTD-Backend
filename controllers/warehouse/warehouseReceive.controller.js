const WarehouseReceive = require("../../models/WarehouseReceive.model");
const PurchaseOrder = require("../../models/PurchaseOrder.model");
const WarehouseStockIn = require("../../models/WarehouseStockIn.model");
const WarehouseProduct = require("../../models/WarehouseProduct.model");
const purchaseOrder = require("../../models/PurchaseOrder.model");
const mongoose = require("mongoose");

// exports.createWarehouseReceive = async (req, res) => {
//     try {
//         const { purchaseOrderId } = req.body;

//         // 1️⃣ Check if purchaseOrderId is provided
//         if (!purchaseOrderId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "purchaseOrderId is required"
//             });
//         }

//         // 2️⃣ Check if purchaseOrderId exists in PurchaseOrder collection
//         const purchaseOrder = await PurchaseOrder.findById(purchaseOrderId);
//         if (!purchaseOrder) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid purchaseOrderId: Purchase Order not found"
//             });
//         }

//         // 3️⃣ Check if this purchaseOrderId already exists in WarehouseReceive
//         const existingReceive = await WarehouseReceive.findOne({ purchaseOrderId });
//         if (existingReceive) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Warehouse receive for this Purchase Order already exists"
//             });
//         }

//         // 4️⃣ Create the warehouse receive with default status "pending"
//         const receive = await WarehouseReceive.create({
//             ...req.body,
//             status: "pending" // ✅ explicitly set default (optional if model default is used)
//         });

//         res.status(201).json({
//             success: true,
//             message: "Warehouse receive saved successfully",
//             data: receive
//         });
//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             success: false,
//             message: "Failed to save warehouse receive"
//         });
//     }
// };


// exports.createWarehouseReceive = async (req, res) => {
//     try {
//         const { purchaseOrderId } = req.body;

//         // 1️⃣ Validate purchaseOrderId
//         if (!purchaseOrderId) {
//             return res.status(400).json({
//                 success: false,
//                 message: "purchaseOrderId is required"
//             });
//         }

//         // 2️⃣ Find the PurchaseOrder
//         const purchaseOrder = await PurchaseOrder.findById(purchaseOrderId);
//         if (!purchaseOrder) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Invalid purchaseOrderId: Purchase Order not found"
//             });
//         }

//         // 3️⃣ Check if a WarehouseReceive already exists for this purchase order
//         const existingReceive = await WarehouseReceive.findOne({ purchaseOrderId });
//         if (existingReceive) {
//             return res.status(400).json({
//                 success: false,
//                 message: "Warehouse receive for this Purchase Order already exists"
//             });
//         }

//         // 4️⃣ Create the WarehouseReceive with default status "pending"
//         const receive = await WarehouseReceive.create({
//             ...req.body,
//             status: "pending" // warehouse receive status
//         });

//         // 5️⃣ Update the PurchaseOrder warehouseStatus to "initialized"
//         purchaseOrder.warehouseStatus = "received";
//         await purchaseOrder.save();

//         res.status(201).json({
//             success: true,
//             message: "Warehouse receive saved and PurchaseOrder warehouseStatus updated",
//             data: receive
//         });

//     } catch (error) {
//         console.error(error);
//         res.status(500).json({
//             success: false,
//             message: "Failed to save warehouse receive"
//         });
//     }
// };



exports.createWarehouseReceive = async (req, res) => {
  try {
    const {
      purchaseOrderId,
      boxQuantity,
      productQuantityWithBox,
      productQuantityWithoutBox,
      remarks
    } = req.body;

    // 1️⃣ Validate purchase order exists
    const purchaseOrder = await PurchaseOrder.findById(purchaseOrderId);
    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        message: "Purchase Order not found"
      });
    }

    // 2️⃣ Prevent duplicate warehouse receive
    const existingReceive = await WarehouseReceive.findOne({ purchaseOrderId });
    if (existingReceive) {
      return res.status(400).json({
        success: false,
        message: "Warehouse receive already exists for this Purchase Order"
      });
    }

    // 3️⃣ Create warehouse receive
    const receive = await WarehouseReceive.create({
      purchaseOrderId,
      boxQuantity,
      productQuantityWithBox,
      productQuantityWithoutBox,
      remarks,
      addedBy: req.user._id, // from auth middleware
      status: "pending"
    });

    // 4️⃣ Update purchase order status
    purchaseOrder.warehouseStatus = "received";
    await purchaseOrder.save();

    res.status(201).json({
      success: true,
      message: "Warehouse receive created successfully",
      data: receive
    });

  } catch (error) {
    console.error("Create warehouse receive error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create warehouse receive"
    });
  }
};

exports.getAllWarehouseReceives = async (req, res) => {
    try {
        const receives = await WarehouseReceive.find()
            .select(
                "receiveDate productName productShortCode netWeight batch expireDate boxQuantity productQuantityWithBox productQuantityWithoutBox status remarks addedBy"
            )
            .sort({ receiveDate: -1 });

        const formattedReceives = receives.map(r => ({
            _id: r._id, // ✅ include MongoDB document ID
            purchaseOrderId: r.purchaseOrderId,
            receiveDate: r.receiveDate,
            productName: r.productName,
            productShortCode: r.productShortCode,
            netWeight: `${r.netWeight.value} ${r.netWeight.unit}`,
            batch: r.batch,
            expireDate: r.expireDate,
            boxQuantity: r.boxQuantity,
            productQuantityWithBox: r.productQuantityWithBox,
            productQuantityWithoutBox: r.productQuantityWithoutBox,
            remarks: r.remarks,
            status: r.status,
            addedByName: r.addedBy?.name,
            addedByEmail: r.addedBy?.email
        }));

        res.json({
            success: true,
            count: formattedReceives.length,
            data: formattedReceives
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Failed to fetch warehouse receives"
        });
    }
};

exports.getAllWarehouseStockIn = async (req, res) => {
    try {
        const stockIns = await WarehouseStockIn.find()
            .populate("purchaseOrderId", "orderNo") // optional
            .populate("warehouseReceiveId", "receiveDate")
            .sort({ stockInDate: -1 });

        const formattedData = stockIns.map((s, index) => ({
            _id: s._id,
            slNo: index + 1,
            purchaseOrderId: s.purchaseOrderId?._id,
            warehouseReceiveId: s.warehouseReceiveId?._id,
            stockInDate: s.stockInDate,
            productName: s.productName,
            productShortCode: s.productShortCode,
            netWeight: `${s.netWeight.value} ${s.netWeight.unit}`,
            batch: s.batch,
            expireDate: s.expireDate,
            boxQuantity: s.boxQuantity,
            productQuantityWithBox: s.productQuantityWithBox,
            productQuantityWithoutBox: s.productQuantityWithoutBox,
            totalStockQuantity:
                (s.productQuantityWithBox || 0) +
                (s.productQuantityWithoutBox || 0),
            remarks: s.remarks,
            addedByName: s.addedBy?.name,
            addedByEmail: s.addedBy?.email
        }));

        res.json({
            success: true,
            count: formattedData.length,
            data: formattedData
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch warehouse stock-in data"
        });
    }
};

// exports.updateWarehouseReceive = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body;

//     // 1️⃣ Find the warehouse receive record
//     const receive = await WarehouseReceive.findById(id);
//     if (!receive) {
//       return res.status(404).json({
//         success: false,
//         message: "Warehouse receive record not found"
//       });
//     }

//     // 2️⃣ Block update if already approved
//     if (receive.status?.toLowerCase() === "approved") {
//       return res.status(400).json({
//         success: false,
//         message: "Approved warehouse receive cannot be updated again"
//       });
//     }

//     // 3️⃣ Update only allowed fields
//     const allowedFields = [
//       "receiveDate","productName","productShortCode","netWeight","batch","expireDate",
//       "boxQuantity","productQuantityWithBox","productQuantityWithoutBox","remarks",
//       "status","addedBy","actualPrice","tradePrice"
//     ];
//     allowedFields.forEach(field => {
//       if (updateData[field] !== undefined) receive[field] = updateData[field];
//     });
//     await receive.save();

//     // 4️⃣ Only process stock-in if status = approved
//     if (receive.status?.toLowerCase() === "approved") {
//       const qtyWithBox = Number(receive.productQuantityWithBox || 0);
//       const qtyWithoutBox = Number(receive.productQuantityWithoutBox || 0);
//       const totalQty = qtyWithBox + qtyWithoutBox;

//       if (totalQty <= 0) {
//         return res.status(400).json({
//           success: false,
//           message: "Total quantity must be greater than zero"
//         });
//       }

//       // 5️⃣ Prevent duplicate stock-in
//       const stockExists = await WarehouseStockIn.findOne({
//         warehouseReceiveId: receive._id
//       });
//       if (stockExists) {
//         return res.status(400).json({
//           success: false,
//           message: "Stock already added for this warehouse receive"
//         });
//       }

//       // 6️⃣ Create stock-in record
//       await WarehouseStockIn.create({
//         warehouseReceiveId: receive._id,
//         purchaseOrderId: receive.purchaseOrderId,
//         productName: receive.productName,
//         productShortCode: receive.productShortCode,
//         netWeight: receive.netWeight,
//         batch: receive.batch,
//         expireDate: receive.expireDate,
//         boxQuantity: receive.boxQuantity,
//         productQuantityWithBox: qtyWithBox,
//         productQuantityWithoutBox: qtyWithoutBox,
//         remarks: receive.remarks,
//         addedBy: receive.addedBy,
//         stockInDate: new Date()
//       });

//       // 7️⃣ Handle WarehouseProduct creation/update
//       const productCode = receive.productShortCode || `AUTO-${Date.now()}`; // safe fallback
//       const existingProduct = await WarehouseProduct.findOne({
//         productCode,
//         batch: receive.batch,
//         "netWeight.value": receive.netWeight?.value,
//         "netWeight.unit": receive.netWeight?.unit,
//         expireDate: receive.expireDate
//       });

//       if (existingProduct) {
//         // Update quantity for existing product
//         existingProduct.totalQuantity = (existingProduct.totalQuantity || 0) + totalQty;
//         await existingProduct.save();
//       } else {
//         // Create new product record
//         await WarehouseProduct.create({
//           productName: receive.productName,
//           productCode,
//           netWeight: receive.netWeight,
//           batch: receive.batch,
//           expireDate: receive.expireDate,
//           totalQuantity: totalQty,
//           actualPrice: receive.actualPrice,
//           tradePrice: receive.tradePrice,
//           lastStockInDate: new Date()
//         });
//       }

//       // 8️⃣ Optional: auto-approve related WarehouseDamage
//     //   if (typeof approveWarehouseDamageByReceiveId === "function") {
//     //     await approveWarehouseDamageByReceiveId(receive._id);
//     //   }
//     }

//     return res.json({
//       success: true,
//       message: "Warehouse receive updated successfully",
//       data: receive
//     });

//   } catch (error) {
//     console.error("WAREHOUSE RECEIVE UPDATE ERROR:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to update warehouse receive",
//       error: error.message
//     });
//   }
// };



// exports.updateWarehouseReceive = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body;

//     // 1️⃣ Find the warehouse receive record
//     const receive = await WarehouseReceive.findById(id);
//     if (!receive) {
//       return res.status(404).json({
//         success: false,
//         message: "Warehouse receive record not found"
//       });
//     }

//     // 2️⃣ Block update if already approved
//     if (receive.status?.toLowerCase() === "approved") {
//       return res.status(400).json({
//         success: false,
//         message: "Approved warehouse receive cannot be updated again"
//       });
//     }

//     // 3️⃣ Update only allowed fields
//     const allowedFields = [
//       "receiveDate",
//       "productName",
//       "productShortCode",
//       "netWeight",
//       "batch",
//       "expireDate",
//       "boxQuantity",
//       "productQuantityWithBox",
//       "productQuantityWithoutBox",
//       "remarks",
//       "status",
//       "addedBy",
//       "actualPrice",
//       "tradePrice"
//     ];

//     allowedFields.forEach(field => {
//       if (updateData[field] !== undefined) {
//         receive[field] = updateData[field];
//       }
//     });

//     await receive.save();

//     // 4️⃣ Process only if status is approved
//     if (receive.status?.toLowerCase() === "approved") {
//       const qtyWithBox = Number(receive.productQuantityWithBox || 0);
//       const qtyWithoutBox = Number(receive.productQuantityWithoutBox || 0);
//       const totalQty = qtyWithBox + qtyWithoutBox;

//       if (totalQty <= 0) {
//         return res.status(400).json({
//           success: false,
//           message: "Total quantity must be greater than zero"
//         });
//       }

//       // 5️⃣ Prevent duplicate stock-in
//       const stockExists = await WarehouseStockIn.findOne({
//         warehouseReceiveId: receive._id
//       });
//       if (stockExists) {
//         return res.status(400).json({
//           success: false,
//           message: "Stock already added for this warehouse receive"
//         });
//       }

//       // 6️⃣ Create stock-in record
//       await WarehouseStockIn.create({
//         warehouseReceiveId: receive._id,
//         purchaseOrderId: receive.purchaseOrderId,
//         productName: receive.productName,
//         productShortCode: receive.productShortCode,
//         netWeight: receive.netWeight,
//         batch: receive.batch,
//         expireDate: receive.expireDate,
//         boxQuantity: receive.boxQuantity,
//         productQuantityWithBox: qtyWithBox,
//         productQuantityWithoutBox: qtyWithoutBox,
//         remarks: receive.remarks,
//         addedBy: receive.addedBy,
//         stockInDate: new Date()
//       });

//       // 7️⃣ Create or update WarehouseProduct
//       const productCode =
//         receive.productShortCode || `AUTO-${Date.now()}`;

//       const existingProduct = await WarehouseProduct.findOne({
//         productCode,
//         batch: receive.batch,
//         "netWeight.value": receive.netWeight?.value,
//         "netWeight.unit": receive.netWeight?.unit,
//         expireDate: receive.expireDate
//       });

//       if (existingProduct) {
//         existingProduct.totalQuantity =
//           (existingProduct.totalQuantity || 0) + totalQty;
//         await existingProduct.save();
//       } else {
//         await WarehouseProduct.create({
//           productName: receive.productName,
//           productCode,
//           netWeight: receive.netWeight,
//           batch: receive.batch,
//           expireDate: receive.expireDate,
//           totalQuantity: totalQty,
//           actualPrice: receive.actualPrice,
//           tradePrice: receive.tradePrice,
//           lastStockInDate: new Date()
//         });
//       }

//       // 8️⃣ Update related Purchase Order warehouse status
//       if (receive.purchaseOrderId) {
//         await PurchaseOrder.findByIdAndUpdate(
//           receive.purchaseOrderId,
//           { warehouseStatus: "approved" },
//           { new: true }
//         );
//       }
//     }

//     return res.json({
//       success: true,
//       message: "Warehouse receive updated successfully",
//       data: receive
//     });

//   } catch (error) {
//     console.error("WAREHOUSE RECEIVE UPDATE ERROR:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to update warehouse receive",
//       error: error.message
//     });
//   }
// };




// exports.updateWarehouseReceive = async (req, res) => {
//   try {
//     // :id === purchaseOrderId
//     const purchaseOrderId = req.params.id;
//     const updateData = req.body;

//     // ✅ Validate ObjectId
//     if (!mongoose.Types.ObjectId.isValid(purchaseOrderId)) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid purchaseOrderId format"
//       });
//     }

//     // ✅ Find WarehouseReceive by purchaseOrderId
//     const receive = await WarehouseReceive.findOne({
//       purchaseOrderId
//     });

//     if (!receive) {
//       return res.status(404).json({
//         success: false,
//         message: "Warehouse receive record not found for this purchase order"
//       });
//     }

//     // ❌ Block update if already approved
//     if (receive.status?.toLowerCase() === "approved") {
//       return res.status(400).json({
//         success: false,
//         message: "Approved warehouse receive cannot be updated again"
//       });
//     }

//     // ✅ Allowed fields
//     const allowedFields = [
//       "receiveDate",
//       "productName",
//       "productShortCode",
//       "netWeight",
//       "batch",
//       "expireDate",
//       "boxQuantity",
//       "productQuantityWithBox",
//       "productQuantityWithoutBox",
//       "remarks",
//       "status",
//       "addedBy",
//       "actualPrice",
//       "tradePrice"
//     ];

//     allowedFields.forEach(field => {
//       if (updateData[field] !== undefined) {
//         receive[field] = updateData[field];
//       }
//     });

//     await receive.save();

//     // ✅ Process only if approved
//     if (receive.status?.toLowerCase() === "approved") {
//       const qtyWithBox = Number(receive.productQuantityWithBox || 0);
//       const qtyWithoutBox = Number(receive.productQuantityWithoutBox || 0);
//       const totalQty = qtyWithBox + qtyWithoutBox;

//       if (totalQty <= 0) {
//         return res.status(400).json({
//           success: false,
//           message: "Total quantity must be greater than zero"
//         });
//       }

//       // ❌ Prevent duplicate stock-in
//       const stockExists = await WarehouseStockIn.findOne({
//         warehouseReceiveId: receive._id
//       });
//       if (stockExists) {
//         return res.status(400).json({
//           success: false,
//           message: "Stock already added for this warehouse receive"
//         });
//       }

//       // ✅ Stock-in
//       await WarehouseStockIn.create({
//         warehouseReceiveId: receive._id,
//         purchaseOrderId: receive.purchaseOrderId,
//         productName: receive.productName,
//         productShortCode: receive.productShortCode,
//         netWeight: receive.netWeight,
//         batch: receive.batch,
//         expireDate: receive.expireDate,
//         boxQuantity: receive.boxQuantity,
//         productQuantityWithBox: qtyWithBox,
//         productQuantityWithoutBox: qtyWithoutBox,
//         remarks: receive.remarks,
//         addedBy: receive.addedBy,
//         stockInDate: new Date()
//       });

//       // ✅ WarehouseProduct update / create
//       const productCode =
//         receive.productShortCode || `AUTO-${Date.now()}`;

//       const existingProduct = await WarehouseProduct.findOne({
//         productCode,
//         batch: receive.batch,
//         "netWeight.value": receive.netWeight?.value,
//         "netWeight.unit": receive.netWeight?.unit,
//         expireDate: receive.expireDate
//       });

//       if (existingProduct) {
//         existingProduct.totalQuantity =
//           (existingProduct.totalQuantity || 0) + totalQty;
//         await existingProduct.save();
//       } else {
//         await WarehouseProduct.create({
//           productName: receive.productName,
//           productCode,
//           netWeight: receive.netWeight,
//           batch: receive.batch,
//           expireDate: receive.expireDate,
//           totalQuantity: totalQty,
//           actualPrice: receive.actualPrice,
//           tradePrice: receive.tradePrice,
//           lastStockInDate: new Date()
//         });
//       }

//       // ✅ Update PurchaseOrder status
//       await PurchaseOrder.findByIdAndUpdate(
//         receive.purchaseOrderId,
//         { warehouseStatus: "approved" }
//       );
//     }

//     return res.json({
//       success: true,
//       message: "Warehouse receive updated successfully",
//       data: receive
//     });

//   } catch (error) {
//     console.error("WAREHOUSE RECEIVE UPDATE ERROR:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Failed to update warehouse receive",
//       error: error.message
//     });
//   }
// };






exports.updateWarehouseReceive = async (req, res) => {
  try {
    const purchaseOrderId = req.params.id;
    const updateData = req.body;

    // ✅ Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(purchaseOrderId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid purchaseOrderId format"
      });
    }

    // ✅ Find WarehouseReceive by purchaseOrderId
    const receive = await WarehouseReceive.findOne({ purchaseOrderId });

    if (!receive) {
      return res.status(404).json({
        success: false,
        message: "Warehouse receive record not found for this purchase order"
      });
    }

    // ❌ Block update if already approved
    if (receive.status?.toLowerCase() === "approved") {
      return res.status(400).json({
        success: false,
        message: "Approved warehouse receive cannot be updated again"
      });
    }

    // ✅ Update allowed fields
    const allowedFields = [
      "receiveDate",
      "productName",
      "productShortCode",
      "netWeight",
      "batch",
      "expireDate",
      "boxQuantity",
      "productQuantityWithBox",
      "productQuantityWithoutBox",
      "remarks",
      "status",
      "addedBy",
      "actualPrice",
      "tradePrice"
    ];

    allowedFields.forEach(field => {
      if (updateData[field] !== undefined) {
        receive[field] = updateData[field];
      }
    });

    await receive.save();

    // ✅ Process only if approved
    if (receive.status?.toLowerCase() === "approved") {
      const qtyWithBox = Number(receive.productQuantityWithBox || 0);
      const qtyWithoutBox = Number(receive.productQuantityWithoutBox || 0);
      const totalQty = qtyWithBox + qtyWithoutBox;

      if (totalQty <= 0) {
        return res.status(400).json({
          success: false,
          message: "Total quantity must be greater than zero"
        });
      }

      // ❌ Prevent duplicate stock-in
      const stockExists = await WarehouseStockIn.findOne({
        warehouseReceiveId: receive._id
      });
      if (stockExists) {
        return res.status(400).json({
          success: false,
          message: "Stock already added for this warehouse receive"
        });
      }

      // ✅ Create stock-in
      await WarehouseStockIn.create({
        warehouseReceiveId: receive._id,
        purchaseOrderId: receive.purchaseOrderId,
        productName: receive.productName,
        productShortCode: receive.productShortCode,
        netWeight: receive.netWeight,
        batch: receive.batch,
        expireDate: receive.expireDate,
        boxQuantity: receive.boxQuantity,
        productQuantityWithBox: qtyWithBox,
        productQuantityWithoutBox: qtyWithoutBox,
        remarks: receive.remarks,
        addedBy: receive.addedBy,
        stockInDate: new Date()
      });

      // ✅ WarehouseProduct create / update
      const productCode = receive.productShortCode || `AUTO-${Date.now()}`;

      const existingProduct = await WarehouseProduct.findOne({
        productCode,
        batch: receive.batch,
        "netWeight.value": receive.netWeight?.value,
        "netWeight.unit": receive.netWeight?.unit,
        expireDate: receive.expireDate
      });

      if (existingProduct) {
        // Update total quantity if already exists
        existingProduct.totalQuantity =
          (existingProduct.totalQuantity || 0) + totalQty;
        await existingProduct.save();
      } else {
        // ✅ Create new product with both IDs
        await WarehouseProduct.create({
          productName: receive.productName,
          productCode,
          netWeight: receive.netWeight,
          batch: receive.batch,
          expireDate: receive.expireDate,
          totalQuantity: totalQty,
          actualPrice: receive.actualPrice,
          tradePrice: receive.tradePrice,
          lastStockInDate: new Date(),
          warehouseReceiveId: receive._id,     // ✅ WarehouseReceive reference
          purchaseOrderId: receive.purchaseOrderId // ✅ PurchaseOrder reference
        });
      }

      // ✅ Update PurchaseOrder status
      await PurchaseOrder.findByIdAndUpdate(
        receive.purchaseOrderId,
        { warehouseStatus: "approved" }
      );
    }

    return res.json({
      success: true,
      message: "Warehouse receive updated successfully",
      data: receive
    });

  } catch (error) {
    console.error("WAREHOUSE RECEIVE UPDATE ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update warehouse receive",
      error: error.message
    });
  }
};
