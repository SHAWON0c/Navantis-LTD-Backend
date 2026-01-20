const mongoose = require("mongoose");
const Area = require("../../models/Area.model");
const User = require("../../models/User.model");
const OrganizationProfile = require("../../models/OrganizationProfile.model");

// 1️⃣ Create Area (POST)
exports.createArea = async (req, res) => {
  try {
    const { areaName } = req.body;

    if (!areaName) {
      return res.status(400).json({
        message: "Area name is required"
      });
    }

    const existingArea = await Area.findOne({ areaName });
    if (existingArea) {
      return res.status(409).json({
        message: "Area already exists"
      });
    }

    const area = await Area.create({
      areaName,
      areaManagerId: null,
      zonalManagerId: null,
      history: []
    });

    res.status(201).json({
      message: "Area created successfully",
      area
    });
  } catch (err) {
    console.error("CREATE AREA ERROR ❌", err);
    res.status(500).json({ message: "Server error" });
  }
};


// 2️⃣ Update Area Managers (PATCH)
exports.updateAreaManagers = async (req, res) => {
  try {
    const { id } = req.params;
    const { areaManagerId, zonalManagerId } = req.body;

    const area = await Area.findById(id);
    if (!area)
      return res.status(404).json({ message: "Area not found" });

    // ---------- VALIDATE AREA MANAGER ----------
    if (areaManagerId) {
      if (!mongoose.Types.ObjectId.isValid(areaManagerId)) {
        return res.status(400).json({
          message: "Invalid areaManagerId format"
        });
      }

      const areaManagerExists = await User.exists({ _id: areaManagerId });
      if (!areaManagerExists) {
        return res.status(404).json({
          message: "Area manager user not found"
        });
      }
    }

    // ---------- VALIDATE ZONAL MANAGER ----------
    if (zonalManagerId) {
      if (!mongoose.Types.ObjectId.isValid(zonalManagerId)) {
        return res.status(400).json({
          message: "Invalid zonalManagerId format"
        });
      }

      const zonalManagerExists = await User.exists({ _id: zonalManagerId });
      if (!zonalManagerExists) {
        return res.status(404).json({
          message: "Zonal manager user not found"
        });
      }
    }

    const isManagerUpdated = areaManagerId || zonalManagerId;

    if (areaManagerId) area.areaManagerId = areaManagerId;
    if (zonalManagerId) area.zonalManagerId = zonalManagerId;

    // ---------- HISTORY ----------
    if (isManagerUpdated) {
      area.history.push({
        areaManagerId: area.areaManagerId,
        zonalManagerId: area.zonalManagerId,
        updatedAt: new Date()
      });
    }

    await area.save();

    res.status(200).json({
      message: "Area updated successfully",
      area
    });
  } catch (err) {
    console.error("UPDATE AREA ERROR ❌", err);
    res.status(500).json({ message: "Server error" });
  }
};



// exports.getAreas = async (req, res) => {
//   try {
//     // 1️⃣ Get areas with users
//     const areas = await Area.find()
//       .populate("areaManagerId", "email role")
//       .populate("zonalManagerId", "email role")
//       .sort({ createdAt: -1 })
//       .lean();

//     // 2️⃣ Collect userIds
//     const userIds = [];
//     areas.forEach(area => {
//       if (area.areaManagerId) userIds.push(area.areaManagerId._id);
//       if (area.zonalManagerId) userIds.push(area.zonalManagerId._id);
//     });

//     // 3️⃣ Fetch organization profiles
//     const profiles = await OrganizationProfile.find({
//       userId: { $in: userIds }
//     }).select("userId name designation");

//     // 4️⃣ Create lookup map
//     const profileMap = {};
//     profiles.forEach(p => {
//       profileMap[p.userId.toString()] = p;
//     });

//     // 5️⃣ Attach organization names
//     const formattedAreas = areas.map(area => ({
//       ...area,
//       areaManager: area.areaManagerId
//         ? {
//             email: area.areaManagerId.email,
//             role: area.areaManagerId.role,
//             name: profileMap[area.areaManagerId._id?.toString()]?.name || null,
//             designation: profileMap[area.areaManagerId._id?.toString()]?.designation || null
//           }
//         : null,
//       zonalManager: area.zonalManagerId
//         ? {
//             email: area.zonalManagerId.email,
//             role: area.zonalManagerId.role,
//             name: profileMap[area.zonalManagerId._id?.toString()]?.name || null,
//             designation: profileMap[area.zonalManagerId._id?.toString()]?.designation || null
//           }
//         : null
//     }));

//     res.status(200).json({ success: true, areas: formattedAreas });

//   } catch (err) {
//     console.error("GET AREAS ERROR ❌", err);
//     res.status(500).json({ success: false, message: "Server error" });
//   }
// };


exports.getAreas = async (req, res) => {
  try {
    // 1️⃣ Get areas with users
    const areas = await Area.find()
      .populate("areaManagerId", "email role")
      .populate("zonalManagerId", "email role")
      .sort({ createdAt: -1 })
      .lean();

    // 2️⃣ Collect userIds
    const userIds = [];
    areas.forEach(area => {
      if (area.areaManagerId) userIds.push(area.areaManagerId._id);
      if (area.zonalManagerId) userIds.push(area.zonalManagerId._id);
    });

    // 3️⃣ Fetch organization profiles
    const profiles = await OrganizationProfile.find({
      userId: { $in: userIds }
    }).select("userId name designation");

    // 4️⃣ Create lookup map
    const profileMap = {};
    profiles.forEach(p => {
      profileMap[p.userId.toString()] = p;
    });

    // 5️⃣ Attach organization names + keep userId
    const formattedAreas = areas.map(area => ({
      ...area,
      areaManager: area.areaManagerId
        ? {
            userId: area.areaManagerId._id,           // ✅ Added userId
            email: area.areaManagerId.email,
            role: area.areaManagerId.role,
            name: profileMap[area.areaManagerId._id?.toString()]?.name || null,
            designation: profileMap[area.areaManagerId._id?.toString()]?.designation || null
          }
        : null,
      zonalManager: area.zonalManagerId
        ? {
            userId: area.zonalManagerId._id,          // ✅ Added userId
            email: area.zonalManagerId.email,
            role: area.zonalManagerId.role,
            name: profileMap[area.zonalManagerId._id?.toString()]?.name || null,
            designation: profileMap[area.zonalManagerId._id?.toString()]?.designation || null
          }
        : null
    }));

    res.status(200).json({ success: true, areas: formattedAreas });

  } catch (err) {
    console.error("GET AREAS ERROR ❌", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
