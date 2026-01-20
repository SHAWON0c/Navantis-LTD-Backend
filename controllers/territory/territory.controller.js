const Territory = require("../../models/Territory.model");
const OrganizationProfile = require("../../models/OrganizationProfile.model");
const Product = require("../../models/Product.model");
const PurchaseOrder = require("../../models/PurchaseOrder.model");
// Get all territories


exports.getAllTerritories = async (req, res) => {
  try {
    const territories = await Territory.find().populate("targets.productId", "productName");
    res.status(200).json({ success: true, data: territories });
  } catch (error) {
    console.error("GET ALL TERRITORIES ERROR:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};


exports.getTerritoriesWithManagers  = async (req, res) => {
  try {
    // 1️⃣ Fetch territories and populate area info
    const territories = await Territory.find()
      .populate({
        path: "areaId",
        select: "areaName areaManagerId zonalManagerId",
        populate: [
          { path: "areaManagerId", select: "email role" },
          { path: "zonalManagerId", select: "email role" }
        ]
      })
      .populate("targets.productId", "productName")
      .lean();

    // 2️⃣ Collect all userIds to fetch organization profiles
    const userIds = [];
    territories.forEach(t => {
      if (t.areaId?.areaManagerId) userIds.push(t.areaId.areaManagerId._id);
      if (t.areaId?.zonalManagerId) userIds.push(t.areaId.zonalManagerId._id);
    });

    const profiles = await OrganizationProfile.find({
      userId: { $in: userIds }
    }).select("userId name designation");

    // 3️⃣ Create a lookup map for quick access
    const profileMap = {};
    profiles.forEach(p => {
      profileMap[p.userId.toString()] = p;
    });

    // 4️⃣ Format territories with org profile info
    const formatted = territories.map(t => ({
      _id: t._id,
      territoryName: t.territoryName,
      marketPoints: t.marketPoints,
      targets: t.targets,
      targetMonth: t.targetMonth,
      area: t.areaId?.areaName || null,
      areaManager: t.areaId?.areaManagerId
        ? {
            userId: t.areaId.areaManagerId._id,
            email: t.areaId.areaManagerId.email,
            role: t.areaId.areaManagerId.role,
            name: profileMap[t.areaId.areaManagerId._id.toString()]?.name || null,
            designation: profileMap[t.areaId.areaManagerId._id.toString()]?.designation || null
          }
        : null,
      zonalManager: t.areaId?.zonalManagerId
        ? {
            userId: t.areaId.zonalManagerId._id,
            email: t.areaId.zonalManagerId.email,
            role: t.areaId.zonalManagerId.role,
            name: profileMap[t.areaId.zonalManagerId._id.toString()]?.name || null,
            designation: profileMap[t.areaId.zonalManagerId._id.toString()]?.designation || null
          }
        : null
    }));

    res.status(200).json({ success: true, data: formatted });

  } catch (error) {
    console.error("GET ALL TERRITORIES ERROR:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};








// exports.getTerritoryTargetSummary = async (req, res) => {
//   try {
//     const territories = await Territory.find()
//       .populate({
//         path: "areaId",
//         select: "areaName areaManagerId zonalManagerId",
//         populate: [
//           { path: "areaManagerId", select: "email role" },
//           { path: "zonalManagerId", select: "email role" }
//         ]
//       })
//       .populate("targets.productId", "tradePrice")
//       .lean();

//     // collect manager userIds
//     const userIds = [];
//     territories.forEach(t => {
//       if (t.areaId?.areaManagerId) userIds.push(t.areaId.areaManagerId._id);
//       if (t.areaId?.zonalManagerId) userIds.push(t.areaId.zonalManagerId._id);
//     });

//     const profiles = await OrganizationProfile.find({
//       userId: { $in: userIds }
//     }).select("userId name designation");

//     const profileMap = {};
//     profiles.forEach(p => {
//       profileMap[p.userId.toString()] = p;
//     });

//     const summary = territories.map(t => {
//       let totalTargetQty = 0;
//       let totalTargetAmount = 0;

//       t.targets.forEach(target => {
//         const qty = target.quantity || 0;
//         const price = target.productId?.tradePrice || 0;

//         totalTargetQty += qty;
//         totalTargetAmount += qty * price;
//       });

//       return {
//         territoryName: t.territoryName, // ✅ TERRITORY NAME INCLUDED

//         areaManager: t.areaId?.areaManagerId
//           ? {
//               name:
//                 profileMap[t.areaId.areaManagerId._id.toString()]?.name || null,
//               email: t.areaId.areaManagerId.email
//             }
//           : null,

//         zonalManager: t.areaId?.zonalManagerId
//           ? {
//               name:
//                 profileMap[t.areaId.zonalManagerId._id.toString()]?.name || null,
//               email: t.areaId.zonalManagerId.email
//             }
//           : null,

//         totalProduct: t.targets.length,
//         totalTargetQty,
//         totalTargetAmount
//       };
//     });

//     res.status(200).json({
//       success: true,
//       data: summary
//     });

//   } catch (error) {
//     console.error("TERRITORY SUMMARY ERROR:", error);
//     res.status(500).json({
//       success: false,
//       message: "Server error",
//       error: error.message
//     });
//   }
// };



exports.getTerritoryTargetSummary = async (req, res) => {
  try {
    // 1️⃣ Fetch territories with area and manager info
    const territories = await Territory.find()
      .populate({
        path: "areaId",
        select: "areaName areaManagerId zonalManagerId",
        populate: [
          { path: "areaManagerId", select: "email role" },
          { path: "zonalManagerId", select: "email role" }
        ]
      })
      .populate("targets.productId", "productName brand shortCode packSize") // fetch product info
      .lean();

    // 2️⃣ Collect manager userIds for profiles
    const userIds = [];
    territories.forEach(t => {
      if (t.areaId?.areaManagerId) userIds.push(t.areaId.areaManagerId._id);
      if (t.areaId?.zonalManagerId) userIds.push(t.areaId.zonalManagerId._id);
    });

    const profiles = await OrganizationProfile.find({
      userId: { $in: userIds }
    }).select("userId name designation");

    const profileMap = {};
    profiles.forEach(p => {
      profileMap[p.userId.toString()] = p;
    });

    // 3️⃣ Fetch purchase orders for all products in all territories
    const productIds = [];
    territories.forEach(t => {
      t.targets.forEach(target => {
        if (target.productId?._id) productIds.push(target.productId._id);
      });
    });

    // Get the latest tradePrice for each product from PurchaseOrder collection
    const purchaseOrders = await PurchaseOrder.find({
      productId: { $in: productIds }
    })
      .sort({ createdAt: -1 }) // latest first
      .lean();

    // Create a map of productId => tradePrice
    const tradePriceMap = {};
    purchaseOrders.forEach(po => {
      if (!tradePriceMap[po.productId.toString()]) {
        tradePriceMap[po.productId.toString()] = po.tradePrice || 0;
      }
    });

    // 4️⃣ Build summary for frontend
    const summary = territories.map(t => {
      let totalTargetQty = 0;
      let totalTargetAmount = 0;

      const targetDetails = t.targets.map(target => {
        const qty = target.quantity || 0;
        const pid = target.productId?._id.toString();
        const tradePrice = tradePriceMap[pid] || 0;
        const totalPrice = qty * tradePrice;

        totalTargetQty += qty;
        totalTargetAmount += totalPrice;

        return {
          productId: pid,
          productName: target.productId?.productName || null,
          brand: target.productId?.brand || null,
          shortCode: target.productId?.shortCode || null,
          packSize: target.productId?.packSize || null,
          quantity: qty,
          tradePrice,
          totalPrice
        };
      });

      return {
        territoryName: t.territoryName || t.areaId?.areaName || "Unknown",
        areaManager: t.areaId?.areaManagerId
          ? {
              name: profileMap[t.areaId.areaManagerId._id.toString()]?.name || null,
              email: t.areaId.areaManagerId.email
            }
          : null,
        zonalManager: t.areaId?.zonalManagerId
          ? {
              name: profileMap[t.areaId.zonalManagerId._id.toString()]?.name || null,
              email: t.areaId.zonalManagerId.email
            }
          : null,
        targets: targetDetails,
        totalProduct: targetDetails.length,
        totalTargetQty,
        totalTargetAmount
      };
    });

    res.status(200).json({ success: true, data: summary });

  } catch (error) {
    console.error("TERRITORY TARGET SUMMARY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message
    });
  }
};


// Get single territory by ID
exports.getTerritoryById = async (req, res) => {
  try {
    const { id } = req.params;
    const territory = await Territory.findById(id)
      .populate("areaId", "areaName")
      .populate("targets.productId", "productName");

    if (!territory) return res.status(404).json({ success: false, message: "Territory not found" });

    res.status(200).json({ success: true, data: territory });
  } catch (error) {
    console.error("GET TERRITORY ERROR:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Create territory
// exports.createTerritory = async (req, res) => {
//   try {
//     const { areaId, marketPoints, targets, targetMonth } = req.body;
//     const territory = new Territory({ areaId, marketPoints, targets, targetMonth });
//     await territory.save();
//     res.status(201).json({ success: true, message: "Territory created", data: territory });
//   } catch (error) {
//     console.error("CREATE TERRITORY ERROR:", error);
//     res.status(500).json({ success: false, message: "Server error", error: error.message });
//   }
// };
exports.createTerritory = async (req, res) => {
  try {
    // ✅ Include territoryName here
    const { areaId, territoryName, marketPoints, targets, targetMonth } = req.body;

    const territory = new Territory({
      areaId,
      territoryName, // <-- this was missing
      marketPoints,
      targets,
      targetMonth,
    });

    await territory.save();

    res.status(201).json({
      success: true,
      message: "Territory created",
      data: territory,
    });
  } catch (error) {
    console.error("CREATE TERRITORY ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: error.message,
    });
  }
};


// Update territory
exports.updateTerritory = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const territory = await Territory.findByIdAndUpdate(id, updates, { new: true });

    if (!territory) return res.status(404).json({ success: false, message: "Territory not found" });

    res.status(200).json({ success: true, message: "Territory updated", data: territory });
  } catch (error) {
    console.error("UPDATE TERRITORY ERROR:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// Delete territory
exports.deleteTerritory = async (req, res) => {
  try {
    const { id } = req.params;
    const territory = await Territory.findByIdAndDelete(id);
    if (!territory) return res.status(404).json({ success: false, message: "Territory not found" });

    res.status(200).json({ success: true, message: "Territory deleted" });
  } catch (error) {
    console.error("DELETE TERRITORY ERROR:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};
