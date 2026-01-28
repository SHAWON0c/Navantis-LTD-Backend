const OrganizationProfile = require("../../models/OrganizationProfile.model");
const User = require("../../models/User.model");

/* ===============================
   CREATE / UPDATE ORGANIZATION PROFILE
   (UPSERT + FIELD HISTORY)
================================ */
exports.upsertOrganizationProfile = async (req, res) => {
  try {
    const { userId } = req.params;
    const updatedBy = req.user._id; // from AuthMiddleware

    // Ensure user exists
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    // Find existing profile
    let profile = await OrganizationProfile.findOne({ userId });

    // Allowed fields to update/create
    const allowedFields = [
      "name","phone","email","profilePic","fathersName","mothersName","dateOfBirth","bloodGroup",
      "presentAddress","permanentAddress",
      "identity","education","employment","payroll","leaveInfo","shiftInfo","healthInfo",
      "emergencyContact","assets","exitInfo"
    ];

    // 🆕 CREATE PROFILE
    if (!profile) {
      profile = new OrganizationProfile({ userId, history: [] });

      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          profile[field] = req.body[field];
        }
      });

      profile.history.push({
        action: "Profile Created",
        newValue: JSON.stringify(req.body),
        updatedBy
      });

      await profile.save();

      return res.status(201).json({
        success: true,
        message: "Organization profile created",
        data: profile
      });
    }

    // 🔄 UPDATE PROFILE WITH HISTORY
    allowedFields.forEach(field => {
      if (
        req.body[field] !== undefined &&
        JSON.stringify(req.body[field]) !== JSON.stringify(profile[field])
      ) {
        profile.history.push({
          action: `${field} Updated`,
          field,
          oldValue: JSON.stringify(profile[field]) || null,
          newValue: JSON.stringify(req.body[field]),
          updatedBy
        });

        profile[field] = req.body[field];
      }
    });

    await profile.save();

    res.status(200).json({
      success: true,
      message: "Organization profile updated",
      data: profile
    });

  } catch (error) {
    console.error("UPSERT PROFILE ERROR:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create/update profile",
      error: error.message
    });
  }
};

/* ===============================
   GET PROFILE BY USER ID
================================ */
exports.getOrganizationProfileByUser = async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await OrganizationProfile.findOne({ userId })
      .populate("userId", "email role")
      .populate("employment.reportingManagerId", "name")
      .populate("employment.territoryId", "territoryName");

    if (!profile) {
      return res.status(404).json({ success: false, message: "Organization profile not found" });
    }

    res.status(200).json({ success: true, data: profile });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===============================
   GET ALL ORGANIZATION PROFILES
================================ */
exports.getAllOrganizationProfiles = async (req, res) => {
  try {
    const profiles = await OrganizationProfile.find()
      .populate("userId", "email role")
      .populate("employment.reportingManagerId", "name")
      .populate("employment.territoryId", "territoryName")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: profiles.length, data: profiles });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* ===============================
   GET PROFILE HISTORY
================================ */
exports.getProfileHistory = async (req, res) => {
  try {
    const { userId } = req.params;

    const profile = await OrganizationProfile.findOne({ userId })
      .select("history")
      .populate("history.updatedBy", "email name");

    if (!profile) {
      return res.status(404).json({ success: false, message: "Profile not found" });
    }

    res.status(200).json({ success: true, data: profile.history });

  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
