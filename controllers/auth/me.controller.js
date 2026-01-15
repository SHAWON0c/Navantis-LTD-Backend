const User = require("../../models/User.model");
const OrganizationProfile = require("../../models/OrganizationProfile.model");

/**
 * GET /me
 * Returns current authenticated user + organization profile
 */
const getMe = async (req, res) => {
  try {
    if (!req.user || !req.user.userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: no user info in request",
      });
    }

    const userId = req.user.userId;

    // 1️⃣ Fetch user info (exclude password)
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // 2️⃣ Fetch organization profile for this user
    const organizationProfile = await OrganizationProfile.findOne({ userId });

    // 3️⃣ Respond with combined data
    return res.status(200).json({
      success: true,
      data: {
        user,
        organizationProfile: organizationProfile || null,
      },
    });
  } catch (err) {
    console.error("GET /me ERROR:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch user profile",
      error: err.message,
    });
  }
};

module.exports = { getMe };
