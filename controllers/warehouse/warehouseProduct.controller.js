const WarehouseProduct = require("../../models/WarehouseProduct.model");

// exports.getWarehouseProductList = async (req, res) => {
//   try {
//     const products = await WarehouseProduct.aggregate([
//       // 1️⃣ Join PurchaseOrder
//       {
//         $lookup: {
//           from: "purchaseorders", // ⚠️ collection name (plural, lowercase)
//           localField: "purchaseOrderId",
//           foreignField: "_id",
//           as: "purchaseOrder"
//         }
//       },

//       // 2️⃣ Convert array to object
//       {
//         $unwind: {
//           path: "$purchaseOrder",
//           preserveNullAndEmptyArrays: true
//         }
//       },

//       // 3️⃣ Calculate trade value per product
//       {
//         $addFields: {
//           tradePrice: "$purchaseOrder.tradePrice",
//           totalTradePrice: {
//             $multiply: [
//               { $ifNull: ["$purchaseOrder.tradePrice", 0] },
//               { $ifNull: ["$totalQuantity", 0] }
//             ]
//           }
//         }
//       },

//       // 4️⃣ Sort latest updated
//       {
//         $sort: { updatedAt: -1 }
//       }
//     ]);

//     // 5️⃣ Calculate grand total
//     const grandTotalTradePrice = products.reduce(
//       (sum, item) => sum + (item.totalTradePrice || 0),
//       0
//     );

//     res.status(200).json({
//       success: true,
//       count: products.length,
//       grandTotalTradePrice,
//       data: products
//     });
//   } catch (error) {
//     console.error("WAREHOUSE PRODUCT LIST ERROR ❌", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch warehouse product list"
//     });
//   }
// };


// exports.getWarehouseProductList = async (req, res) => {
//   try {
//     const products = await WarehouseProduct.aggregate([
//       // 1️⃣ Join PurchaseOrder
//       {
//         $lookup: {
//           from: "purchaseorders",
//           localField: "purchaseOrderId",
//           foreignField: "_id",
//           as: "purchaseOrder"
//         }
//       },
//       // 2️⃣ Convert array to object
//       {
//         $unwind: {
//           path: "$purchaseOrder",
//           preserveNullAndEmptyArrays: true
//         }
//       },
//       // 3️⃣ Calculate trade value per product
//       {
//         $addFields: {
//           tradePrice: { $ifNull: ["$purchaseOrder.tradePrice", 0] },
//           totalTradePrice: {
//             $multiply: [
//               { $ifNull: ["$purchaseOrder.tradePrice", 0] },
//               { $ifNull: ["$totalQuantity", 0] }
//             ]
//           }
//         }
//       },
//       // 4️⃣ Project only required fields
//       {
//         $project: {
//           _id: 1,
//           productName: 1,
//           productCode: 1,
//           netWeight: 1,
//           batch: 1,
//           expireDate: 1,
//           totalQuantity: 1,
//           tradePrice: 1,
//           totalTradePrice: 1
//         }
//       },
//       // 5️⃣ Sort latest updated
//       { $sort: { updatedAt: -1 } }
//     ]);

//     // 6️⃣ Calculate totals
//     const totalTradePrice = products.reduce((sum, p) => sum + (p.totalTradePrice || 0), 0);
//     const uniqueProductsCount = new Set(products.map(p => p.productCode)).size;

//     res.status(200).json({
//       success: true,
//       count: products.length,
//       uniqueProductsCount,
//       totalTradePrice,
//       data: products
//     });
//   } catch (error) {
//     console.error("WAREHOUSE PRODUCT LIST ERROR ❌", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch warehouse product list"
//     });
//   }
// };


exports.getWarehouseProductList = async (req, res) => {
  try {
    const data = await WarehouseProduct.aggregate([
      /* 🔗 Join Products */
      {
        $lookup: {
          from: "products", // collection name
          localField: "productId",
          foreignField: "_id",
          as: "product"
        }
      },
      {
        $unwind: {
          path: "$product",
          preserveNullAndEmptyArrays: true
        }
      },

      /* 🔗 Join PurchaseOrders (for price) */
      {
        $lookup: {
          from: "purchaseorders",
          localField: "lastPurchaseOrderId",
          foreignField: "_id",
          as: "purchaseOrder"
        }
      },
      {
        $unwind: {
          path: "$purchaseOrder",
          preserveNullAndEmptyArrays: true
        }
      },

      /* 🎯 Final shape */
      {
        $project: {
          _id: 1,
          productId: 1,
          batch: 1,
          expireDate: 1,
          totalQuantity: 1,
          lastStockInDate: 1,

          /* 📦 Product details */
          productName: "$product.productName",
          brand: "$product.brand",
          productShortCode: "$product.productShortCode",
          packSize: "$product.packSize",
          category: "$product.category",

          /* 💰 Prices */
          tradePrice: "$purchaseOrder.tradePrice",
          actualPrice: "$purchaseOrder.actualPrice"
        }
      }
    ]);

    return res.json({
      success: true,
      data
    });

  } catch (error) {
    console.error("GET WAREHOUSE PRODUCT LIST ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch warehouse product list"
    });
  }
};
