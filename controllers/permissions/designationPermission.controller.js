// controllers/permissions/designationPermission.controller.js
const DesignationPermission = require("../../models/DesignationPermission");

// Create or update designation permissions
exports.createOrUpdateDesignationPermission = async (req, res) => {
  try {
    const { designation, permissions } = req.body;

    if (!designation || !Array.isArray(permissions)) {
      return res.status(400).json({
        success: false,
        message: "Please provide a designation and an array of permissions"
      });
    }

    // Upsert: create if not exists, update if exists
    const designationPermission = await DesignationPermission.findOneAndUpdate(
      { designation },
      { $set: { permissions } },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: "Designation permissions saved successfully",
      data: designationPermission
    });
  } catch (error) {
    console.error("CREATE/UPDATE DESIGNATION PERMISSION ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to save designation permissions",
      error: error.message
    });
  }
};

// Get all designation permissions
exports.getAllDesignationPermissions = async (req, res) => {
  try {
    const permissions = await DesignationPermission.find().sort({ designation: 1 });
    res.status(200).json({
      success: true,
      count: permissions.length,
      data: permissions
    });
  } catch (error) {
    console.error("GET DESIGNATION PERMISSIONS ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch designation permissions",
      error: error.message
    });
  }
};
