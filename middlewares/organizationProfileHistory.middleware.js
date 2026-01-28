const OrganizationProfile = require("../models/OrganizationProfile.model");

const trackProfileHistory = async (req, res, next) => {
  try {
    const profile = await OrganizationProfile.findById(req.params.id);
    if (!profile) return next();

    const history = [];

    // Track designation
    if (
      req.body.designation &&
      req.body.designation !== profile.designation
    ) {
      history.push({
        action: "Designation Updated",
        oldValue: profile.designation || "N/A",
        newValue: req.body.designation,
        updatedBy: req.user._id
      });
    }

    // Track territory
    if (
      req.body.territoryId &&
      String(req.body.territoryId) !== String(profile.territoryId)
    ) {
      history.push({
        action: "Territory Updated",
        oldValue: profile.territoryId
          ? profile.territoryId.toString()
          : "N/A",
        newValue: req.body.territoryId,
        updatedBy: req.user._id
      });
    }

    req.historyLogs = history;
    next();
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

module.exports = trackProfileHistory;
