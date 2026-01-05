const WarehouseReceive = require("../../models/WarehouseReceive.model");
const PurchaseOrder = require("../../models/PurchaseOrder.model");
const WarehouseStockIn = require("../../models/WarehouseStockIn.model");


const WarehouseProduct = require("../../models/WarehouseProduct.model");

const warehouse=require("../../models/Warehouse.model");


// exports.createWarehouseReceive = async (req, res) => {
//   try {
//     const { purchaseOrderId } = req.body;

//     // 1️⃣ Check if purchaseOrderId is provided
//     if (!purchaseOrderId) {
//       return res.status(400).json({
//         success: false,
//         message: "purchaseOrderId is required"
//       });
//     }

//     // 2️⃣ Check if purchaseOrderId exists in PurchaseOrder collection
//     const purchaseOrder = await PurchaseOrder.findById(purchaseOrderId);
//     if (!purchaseOrder) {
//       return res.status(400).json({
//         success: false,
//         message: "Invalid purchaseOrderId: Purchase Order not found"
//       });
//     }

//     // 3️⃣ Check if this purchaseOrderId already exists in WarehouseReceive
//     const existingReceive = await WarehouseReceive.findOne({ purchaseOrderId });
//     if (existingReceive) {
//       return res.status(400).json({
//         success: false,
//         message: "Warehouse receive for this Purchase Order already exists"
//       });
//     }

//     // 4️⃣ Create the warehouse receive
//     const receive = await WarehouseReceive.create(req.body);

//     res.status(201).json({
//       success: true,
//       message: "Warehouse receive saved successfully",
//       data: receive
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to save warehouse receive"
//     });
//   }
// };


exports.createWarehouseReceive = async (req, res) => {
    try {
        const { purchaseOrderId } = req.body;

        // 1️⃣ Check if purchaseOrderId is provided
        if (!purchaseOrderId) {
            return res.status(400).json({
                success: false,
                message: "purchaseOrderId is required"
            });
        }

        // 2️⃣ Check if purchaseOrderId exists in PurchaseOrder collection
        const purchaseOrder = await PurchaseOrder.findById(purchaseOrderId);
        if (!purchaseOrder) {
            return res.status(400).json({
                success: false,
                message: "Invalid purchaseOrderId: Purchase Order not found"
            });
        }

        // 3️⃣ Check if this purchaseOrderId already exists in WarehouseReceive
        const existingReceive = await WarehouseReceive.findOne({ purchaseOrderId });
        if (existingReceive) {
            return res.status(400).json({
                success: false,
                message: "Warehouse receive for this Purchase Order already exists"
            });
        }

        // 4️⃣ Create the warehouse receive with default status "pending"
        const receive = await WarehouseReceive.create({
            ...req.body,
            status: "pending" // ✅ explicitly set default (optional if model default is used)
        });

        res.status(201).json({
            success: true,
            message: "Warehouse receive saved successfully",
            data: receive
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Failed to save warehouse receive"
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




// exports.updateWarehouseReceive = async (req, res) => {
//   try {
//     const { id } = req.params; // MongoDB _id of the warehouse receive
//     const updateData = req.body;

//     // 1️⃣ Check if record exists
//     const receive = await WarehouseReceive.findById(id);
//     if (!receive) {
//       return res.status(404).json({
//         success: false,
//         message: "Warehouse receive record not found"
//       });
//     }

//     // 2️⃣ Update allowed fields only
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
//       "addedBy"
//     ];

//     allowedFields.forEach(field => {
//       if (updateData[field] !== undefined) {
//         receive[field] = updateData[field];
//       }
//     });

//     // 3️⃣ Save changes
//     await receive.save();

//     res.json({
//       success: true,
//       message: "Warehouse receive updated successfully",
//       data: receive
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to update warehouse receive"
//     });
//   }
// };



// exports.updateWarehouseReceive = async (req, res) => {
//   try {
//     const { id } = req.params;
//     const updateData = req.body;

//     // 1️⃣ Find the warehouse receive
//     const receive = await WarehouseReceive.findById(id);
//     if (!receive) {
//       return res.status(404).json({
//         success: false,
//         message: "Warehouse receive record not found"
//       });
//     }

//     // 2️⃣ Update allowed fields only
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
//       "addedBy"
//     ];

//     allowedFields.forEach(field => {
//       if (updateData[field] !== undefined) {
//         receive[field] = updateData[field];
//       }
//     });

//     // 3️⃣ Save changes
//     await receive.save();

//     // 4️⃣ If status is approved, create stock-in record
//     if (updateData.status && updateData.status.toLowerCase() === "approved") {
//       // Check if stock-in already exists to avoid duplicates
//       const existingStock = await WarehouseStockIn.findOne({ warehouseReceiveId: receive._id });
//       if (!existingStock) {
//         await WarehouseStockIn.create({
//           warehouseReceiveId: receive._id,
//           purchaseOrderId: receive.purchaseOrderId,
//           productName: receive.productName,
//           productShortCode: receive.productShortCode,
//           netWeight: receive.netWeight,
//           batch: receive.batch,
//           expireDate: receive.expireDate,
//           boxQuantity: receive.boxQuantity,
//           productQuantityWithBox: receive.productQuantityWithBox,
//           productQuantityWithoutBox: receive.productQuantityWithoutBox,
//           remarks: receive.remarks,
//           addedBy: receive.addedBy
//         });
//       }
//     }

//     res.json({
//       success: true,
//       message: "Warehouse receive updated successfully",
//       data: receive
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to update warehouse receive"
//     });
//   }
// };



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

//     const receive = await WarehouseReceive.findById(id);
//     if (!receive) {
//       return res.status(404).json({
//         success: false,
//         message: "Warehouse receive record not found"
//       });
//     }

//     // 1️⃣ Update allowed fields
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

//     // 2️⃣ If approved → Stock In + Product Update
//     if (updateData.status?.toLowerCase() === "approved") {

//       const totalQty =
//         (receive.productQuantityWithBox || 0) +
//         (receive.productQuantityWithoutBox || 0);

//       // 🔹 Create Stock In (no duplicate)
//       const existingStock = await WarehouseStockIn.findOne({
//         warehouseReceiveId: receive._id
//       });

//       if (!existingStock) {
//         await WarehouseStockIn.create({
//           warehouseReceiveId: receive._id,
//           purchaseOrderId: receive.purchaseOrderId,
//           productName: receive.productName,
//           productShortCode: receive.productShortCode,
//           netWeight: receive.netWeight,
//           batch: receive.batch,
//           expireDate: receive.expireDate,
//           boxQuantity: receive.boxQuantity,
//           productQuantityWithBox: receive.productQuantityWithBox,
//           productQuantityWithoutBox: receive.productQuantityWithoutBox,
//           remarks: receive.remarks,
//           addedBy: receive.addedBy
//         });
//       }

//       // 🔹 UPSERT Warehouse Product
//       await WarehouseProduct.findOneAndUpdate(
//         {
//           productName: receive.productName,
//           productCode: receive.productShortCode,
//           "netWeight.value": receive.netWeight.value,
//           "netWeight.unit": receive.netWeight.unit,
//           batch: receive.batch,
//           expireDate: receive.expireDate
//         },
//         {
//           $inc: { totalQuantity: totalQty },
//           $set: {
//             actualPrice: receive.actualPrice,
//             tradePrice: receive.tradePrice,
//             lastStockInDate: new Date()
//           }
//         },
//         {
//           upsert: true,
//           new: true
//         }
//       );
//     }

//     res.json({
//       success: true,
//       message: "Warehouse receive updated and stock synced successfully",
//       data: receive
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to update warehouse receive"
//     });
//   }
// };


exports.updateWarehouseReceive = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const receive = await WarehouseReceive.findById(id);
        if (!receive) {
            return res.status(404).json({
                success: false,
                message: "Warehouse receive record not found"
            });
        }

        // 1️⃣ Update only allowed fields
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

        // 2️⃣ Stock in only if approved
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

            // 3️⃣ Prevent duplicate stock-in
            const stockExists = await WarehouseStockIn.findOne({
                warehouseReceiveId: receive._id
            });

            if (!stockExists) {
                // 4️⃣ Create stock-in record
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
                    addedBy: receive.addedBy
                });
            }

            // 5️⃣ ALWAYS INSERT INTO WarehouseProduct (no upsert)
            await WarehouseProduct.create({
                productName: receive.productName || "Test Product",
                productCode: receive.productShortCode || "TEST-001",
                netWeight: receive.netWeight || { value: 500, unit: "gm" },
                batch: receive.batch || "TEST-BATCH",
                expireDate: receive.expireDate || new Date("2026-12-31"),
                totalQuantity: totalQty > 0 ? totalQty : 10,
                actualPrice: receive.actualPrice || 50,
                tradePrice: receive.tradePrice || 45,
                lastStockInDate: new Date(),
                createdAt: new Date()
            });
        }

        return res.json({
            success: true,
            message: "Warehouse receive updated and WarehouseProduct inserted successfully",
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


