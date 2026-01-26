const marketPointModel = require("../../models/marketPoint.model");


// ➕ Create Market Point
exports.createMarketPoint = async (req, res) => {
  try {
    const { name, territoryId } = req.body;

    if (!name || !territoryId) {
      return res.status(400).json({
        message: "Name and territoryId are required",
      });
    }

    const marketPoint = await marketPointModel.create({
      name,
      territoryId,
    });

    res.status(201).json({
      message: "Market point created successfully",
      data: marketPoint,
    });
  } catch (error) {
    res.status(400).json({
      message: error.code === 11000
        ? "Market point already exists in this territory"
        : error.message,
    });
  }
};

// 📄 Get All Market Points
exports.getMarketPoints = async (req, res) => {
  try {
    const marketPoints = await marketPointModel.find()
      .populate({
        path: "territoryId",
        select: "name areaId",
        populate: {
          path: "areaId",
          model: "Area", // must match Area model name
        },
      })
      .sort({ name: 1 });

    res.json({
      success: true,
      data: marketPoints,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// 🔍 Get Market Points by Territory
exports.getMarketPointsByTerritory = async (req, res) => {
  try {
    const { territoryId } = req.params;

    const marketPoints = await MarketPoint.find({ territoryId })
      .sort({ name: 1 });

    res.json({ data: marketPoints });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// 🔍 Get Single Market Point
exports.getMarketPointById = async (req, res) => {
  try {
    const marketPoint = await MarketPoint.findById(req.params.id)
      .populate("territoryId", "name");

    if (!marketPoint) {
      return res.status(404).json({ message: "Market point not found" });
    }

    res.json({ data: marketPoint });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// ❌ Delete Market Point
exports.deleteMarketPoint = async (req, res) => {
  try {
    const deleted = await MarketPoint.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: "Market point not found" });
    }

    res.json({ message: "Market point deleted successfully" });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
