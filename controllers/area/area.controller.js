const mongoose = require("mongoose");
const Area = require("../../models/Area.model");
const User = require("../../models/user.model");


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


// 3️⃣ Get all areas
exports.getAreas = async (req, res) => {
  try {
    const areas = await Area.find()
      .populate("areaManagerId", "name email role")
      .populate("zonalManagerId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({ areas });
  } catch (err) {
    console.error("GET AREAS ERROR ❌", err);
    res.status(500).json({ message: "Server error" });
  }
};
