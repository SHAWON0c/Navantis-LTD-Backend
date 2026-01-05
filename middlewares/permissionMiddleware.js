// middlewares/permissionMiddleware.js
const OrganizationProfile = require("../models/OrganizationProfile.model");
const DesignationPermission = require("../models/DesignationPermission");

const checkPermission = (requiredPermission) => {
  return async (req, res, next) => {
    try {
      const userId = req.user._id; // assuming auth middleware sets req.user
      const orgProfile = await OrganizationProfile.findOne({ userId });

      if (!orgProfile) {
        return res.status(404).json({ success: false, message: "Organization profile not found" });
      }

      const designationPerm = await DesignationPermission.findOne({ designation: orgProfile.designation });
      const permissions = [...(designationPerm?.permissions || [])];

      if (!permissions.includes(requiredPermission)) {
        return res.status(403).json({ success: false, message: "Forbidden: insufficient permissions" });
      }

      next();
    } catch (error) {
      console.error("PERMISSION CHECK ERROR:", error);
      return res.status(500).json({ success: false, message: "Server error", error: error.message });
    }
  };
};

module.exports = checkPermission;
